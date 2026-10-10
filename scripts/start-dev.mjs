import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const windows = process.platform === 'win32';
const flags = process.argv.slice(2);
const children = [];
const serviceLogs = [];
const logs = join(root, '.dev');
let stopping = false;
let dockerReady = false;
process.chdir(root);

// npm.cmd requires cmd.exe on Windows; all arguments here are fixed literals.
function launch(command, args, options = {}) {
  if (windows && command === 'npm') {
    args = ['/d', '/s', '/c', `npm.cmd ${args.join(' ')}`];
    command = process.env.ComSpec || 'cmd.exe';
  }
  return spawn(command, args, { cwd: root, windowsHide: true, detached: !windows, ...options });
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = launch(command, args, options);
    children.push(child);
    let stdout = '', stderr = '';
    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(stdout) : reject(
      new Error(`${command} ${args.join(' ')} failed (${code}).\n${stderr}\n${stdout}`)));
  });
}

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children.reverse()) {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null) continue;
    if (windows) spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
    else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); }
    }
  }
  console.log('Backend/frontend stopped.');
  if (dockerReady) {
    console.log('Stopping Postgres: docker compose stop db');
    const result = spawnSync('docker', ['compose', 'stop', '--timeout', '10', 'db'], {
      cwd: root, windowsHide: true, stdio: 'inherit', timeout: 30_000,
    });
    if (result.error || result.status !== 0) {
      console.error('Postgres could not be stopped. Retry: docker compose stop db');
      code = 1;
    }
  }
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.exit(code);
}

function fail(error) {
  console.error(error.message);
  for (const path of serviceLogs) {
    if (existsSync(path)) console.error(`\n${path}\n${readFileSync(path, 'utf8').split(/\r?\n/).slice(-20).join('\n')}`);
  }
  stop(1);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
// On Windows, console Ctrl+C otherwise reaches npm/cmd and the supervisor at
// once, which can orphan Vite. Read it here and stop the process trees ourselves.
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', data => { if (data.includes(3)) stop(0); });
}

async function portAvailable(port, host) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', error => {
      if (error.code === 'EAFNOSUPPORT' || error.code === 'EADDRNOTAVAIL') return resolve();
      error.message = `Port ${port} (${host}): ${error.code}. ` +
        (error.code === 'EACCES' ? 'Windows may have reserved this port.' : 'The port could not be freed.');
      reject(error);
    });
    server.listen(port, host, () => server.close(resolve));
  });
}

async function clearPort(port) {
  let owners;
  if (windows) {
    const script = `$owners = @(Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue | ` +
      `Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { ` +
      `$owner = Get-Process -Id $_ -ErrorAction SilentlyContinue; ` +
      `if ($owner) { [pscustomobject]@{ pid = $owner.Id; name = $owner.ProcessName } } }); ` +
      `ConvertTo-Json -InputObject $owners -Compress`;
    owners = JSON.parse(await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script]));
  } else {
    const result = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fpc'], { encoding: 'utf8' });
    if (result.error || (result.status !== 0 && result.status !== 1))
      throw new Error('Install lsof to identify and stop processes occupying application ports.');
    owners = [...result.stdout.matchAll(/^p(\d+)\nc([^\n]*)/gm)].map(match => ({ pid: Number(match[1]), name: match[2] }));
  }
  for (const owner of owners) {
    const pid = Number(owner.pid);
    if (!Number.isInteger(pid) || pid <= 4 || pid === process.pid || pid === process.ppid)
      throw new Error(`Refusing to stop the system or launcher process on port ${port} (PID ${pid}).`);
    console.log(`Port ${port}: ${owner.name} (PID ${pid}) — stopping process...`);
    if (windows) await run('taskkill', ['/pid', String(pid), '/t', '/f']);
    else {
      try { process.kill(pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  }
  if (!owners.length) return;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      for (const host of ['127.0.0.1', '::1']) await portAvailable(port, host);
      return;
    } catch (error) {
      if (attempt === 19) throw error;
      if (!windows && attempt === 9) {
        for (const owner of owners) {
          try { process.kill(Number(owner.pid), 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
        }
      }
      await delay(100);
    }
  }
}

async function choosePort(variable, fallback) {
  const requested = process.env[variable];
  const candidates = requested ? [Number(requested)] : fallback;
  for (const port of candidates) {
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error(`${variable} must be a port between 1024 and 65535.`);
    try {
      for (const host of ['127.0.0.1', '::1']) await portAvailable(port, host);
      return port;
    } catch (error) {
      if (error.code === 'EADDRINUSE' || (windows && error.code === 'EACCES')) {
        await clearPort(port);
        try {
          for (const host of ['127.0.0.1', '::1']) await portAvailable(port, host);
          return port;
        } catch (retryError) { error = retryError; }
      }
      if (error.code !== 'EACCES' || requested) throw error;
      console.log(`Port ${port} is reserved; trying an alternative...`);
    }
  }
  throw new Error(`No usable port found. Set ${variable} to a free port.`);
}

function serve(name, command, args, options = {}) {
  const path = join(logs, `${name}.log`);
  serviceLogs.push(path);
  const log = createWriteStream(path);
  log.on('error', fail);
  const child = launch(command, args, options);
  children.push(child);
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  child.on('error', fail);
  child.on('close', (code, signal) => {
    log.end(() => {
      if (!stopping) fail(new Error(`${name} stopped unexpectedly (${signal || code}).`));
    });
  });
}

async function ready(url, validate = () => true) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok && validate(await response.text())) return;
    } catch { /* The service may still be starting. */ }
    await delay(500);
  }
  throw new Error(`Service did not become ready in 90s: ${url}`);
}

async function main() {
  if (flags.some(flag => !['--check', '--migrate'].includes(flag)))
    throw new Error('Usage: node scripts/start-dev.mjs [--check] [--migrate]');
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new Error('Node.js 22.12+ is required.');

  console.log('[1/5] Checking Node, npm, .NET 10 and Docker Compose...');
  await run('npm', ['--version']);
  const sdks = await run('dotnet', ['--list-sdks']);
  if (!/^10\./m.test(sdks)) throw new Error('.NET SDK 10 is required.');
  await run('docker', ['compose', 'version']);
  try { await run('docker', ['info', '--format', '{{.ServerVersion}}']); }
  catch { throw new Error('Docker is unavailable. Start Docker Desktop and wait for the engine.'); }
  dockerReady = true;
  const backendPort = await choosePort('SPECHUB_BACKEND_PORT', [5117, 7117, 8117, 9117]);
  const frontendPort = await choosePort('SPECHUB_FRONTEND_PORT', [5173, 7173, 8173, 9173]);
  if (backendPort === frontendPort) throw new Error('Backend and frontend ports must differ.');
  const backendUrl = `http://localhost:${backendPort}`;
  const frontendUrl = `http://localhost:${frontendPort}`;

  console.log('[2/5] Preparing environment and dependencies...');
  for (const path of ['.env', 'frontend/.env'])
    if (!existsSync(path)) copyFileSync(`${path}.example`, path);
  mkdirSync(logs, { recursive: true });
  const lockHash = createHash('sha256').update(readFileSync('frontend/package-lock.json')).digest('hex');
  const stamp = join(logs, 'frontend-lock.sha256');
  if (!existsSync('frontend/node_modules/.package-lock.json') || !existsSync(stamp) || readFileSync(stamp, 'utf8') !== lockHash) {
    console.log('Installing frontend packages (npm ci)...');
    await run('npm', ['ci'], { cwd: join(root, 'frontend') });
    writeFileSync(stamp, lockHash);
  }
  console.log('Building backend...');
  await run('dotnet', ['build', 'backend/SpecHub.Api', '--nologo']);

  console.log('[3/5] Starting Postgres and waiting for its healthcheck...');
  // Compose resolves .env, quoting and overrides; never print credentials.
  const config = JSON.parse(await run('docker', ['compose', 'config', '--format', 'json']));
  const db = config.services.db;
  const port = db.ports.find(port => Number(port.target) === 5432)?.published;
  if (!port || !/^\d+$/.test(String(port))) throw new Error('Postgres must publish a fixed port in docker-compose.yml.');
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const connection = `Host=127.0.0.1;Port=${port};Database=${quote(db.environment.POSTGRES_DB)};Username=${quote(db.environment.POSTGRES_USER)};Password=${quote(db.environment.POSTGRES_PASSWORD)}`;
  await run('docker', ['compose', 'up', '-d', '--wait', '--wait-timeout', '90', 'db']);

  console.log('[4/5] Starting backend, checking database and migrations...');
  serve('backend', 'dotnet', ['run', '--project', 'backend/SpecHub.Api', '--no-build', '--no-launch-profile', '--urls', backendUrl], {
    env: { ...process.env, ASPNETCORE_ENVIRONMENT: 'Development', DOTNET_ENVIRONMENT: 'Development',
      ConnectionStrings__DefaultConnection: process.env.ConnectionStrings__DefaultConnection || connection,
      Database__ApplyMigrations: String(flags.includes('--migrate')) },
  });
  await ready(`${backendUrl}/health`, text => text === 'Healthy');

  console.log('[5/5] Starting frontend and checking its API proxy...');
  serve('frontend', 'npm', ['run', 'dev', '--', '--host', 'localhost', '--port', String(frontendPort), '--strictPort'], {
    cwd: join(root, 'frontend'), env: { ...process.env, SPECHUB_BACKEND_URL: backendUrl },
  });
  await ready(`${frontendUrl}/`, text => text.includes('id="root"'));
  await ready(`${frontendUrl}/api/health`, text => JSON.parse(text).status === 'ok');
  console.log(`Ready:\n  Frontend: ${frontendUrl}\n  Backend:  ${backendUrl}\n  Swagger:  ${backendUrl}/swagger\n  DB check: ${backendUrl}/health\n  Logs:     ${logs}\nStop: Ctrl+C`);
  if (flags.includes('--check')) {
    for (const path of ['/api/users', '/api/template?userId=startup-check']) {
      const response = await fetch(`${frontendUrl}${path}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok || !Array.isArray(await response.json())) throw new Error(`Database/API check failed: ${path}`);
    }
    console.log('Startup check passed: frontend, proxy, database, users and templates.');
    stop(0);
  }
}

main().catch(fail);
