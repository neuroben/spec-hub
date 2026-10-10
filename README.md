# SpecHub

React 19 + Vite 8 + TypeScript frontend, .NET 10 REST API és PostgreSQL 18.

## Közös indítás

Előfeltételek: Node.js **22.12+**, npm, **.NET SDK 10**, Docker és Docker Compose v2 (`up --wait` támogatással). Windows alatt előbb induljon el a Docker Desktop.

```powershell
# Windows, a projekt gyökeréből
.\start-dev.ps1
# Ha a helyi PowerShell execution policy blokkolja:
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-dev.ps1
```

```sh
# Linux / macOS
sh ./start-dev.sh
```

A két belépőszkript ugyanazt a függőségmentes Node indítót használja: `scripts/start-dev.mjs`. Más munkakönyvtárból és szóközös elérési úttal is indítható.

Az indító:

1. Ellenőrzi az eszközöket, a Docker engine-t és a portokat. Foglalt alkalmazásportnál kiírja a folyamat nevét és PID-jét, majd leállítja és megvárja a port felszabadulását.
2. A hiányzó `.env` fájlokat a példákból létrehozza. Első indításkor vagy megváltozott frontend lockfile esetén `npm ci`-t futtat, majd lefordítja a backendet.
3. Elindítja a Postgrest, és megvárja a Docker healthchecket. A Compose által feloldott adatbázis-beállításokat átadja a backendnek is.
4. Elindítja az API-t Development módban. Üres adatbázison alkalmazza a migrációkat; ellenőrzi a `/health` választ.
5. Elindítja a frontendet, ellenőrzi a HTML-t és a frontend `/api/health` proxyját. Csak ezek után írja ki, hogy kész.

Alapértelmezett portok: backend **5117**, frontend **5173**, Postgres **5432**. Ha a Windows fenntartotta az alkalmazásportokat (`EACCES`), az indító 7117/7173, majd 8117/8173 és 9117/9173 portokkal próbálkozik. A Vite proxy automatikusan a kiválasztott API-portot használja. Futó folyamat által foglalt backend/frontend portot az indító automatikusan felszabadít: Windows alatt `Get-NetTCPConnection` alapján azonosít, majd `taskkill /PID ... /T /F` segítségével leállítja a folyamatfát. Linux/macOS alatt ehhez `lsof` szükséges. Rendszerfolyamatot és saját indítóját nem állítja le; jogosultsági hibánál megáll. A PostgreSQL portját a Docker Compose kezeli. **Mindig a végén kiírt URL-eket használd.**

Egyedi alkalmazásportok:

```powershell
$env:SPECHUB_BACKEND_PORT = '8117'
$env:SPECHUB_FRONTEND_PORT = '8173'
.\start-dev.ps1
```

```sh
SPECHUB_BACKEND_PORT=8117 SPECHUB_FRONTEND_PORT=8173 sh ./start-dev.sh
```

A backend és a frontend egyetlen terminálból fut. **Ctrl+C** mindkettő folyamatfáját leállítja, majd lefuttatja a `docker compose stop db` parancsot. Hiba esetén ugyanez a takarítás történik, az indító nem nulla hibakóddal lép ki. Naplók: `.dev/backend.log`, `.dev/frontend.log`. Az adatvolume megmarad. Ha a Docker leállítása hibázik, az indító ezt jelzi; kézi újrapróbálás: `docker compose stop db`.

## Indítási ellenőrzés

```powershell
.\start-dev.ps1 -Check
```

```sh
sh ./start-dev.sh --check
```

Valóban elindítja a rendszert, ellenőrzi a frontend HTML-t, az API proxyt, az adatbázis-kapcsolatot, továbbá a felhasználó- és sablonlistázást. Ezután leállítja a frontend/backend folyamatokat és a Compose adatbázist; siker esetén 0 a kilépési kód.

## Adatbázis és migrációk

A root `.env` `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` értékeit a Compose és a közös indító egyaránt használja. Meglévő PostgreSQL-volume esetén a felhasználó/jelszó/adatbázis átírása nem módosítja a már létrehozott adatbázist.

**Meglévő, régi sémájú adatbázis frissítése külön engedélyezést igényel.** A `20260926161902_DtoSeparation` migráció törli a régi `Documents`, `Modules`, `DocumentModules` táblákat. Előbb készíts adatbázismentést és ellenőrizd a függő migrációkat. Ezután:

```powershell
.\start-dev.ps1 -Migrate
```

```sh
sh ./start-dev.sh --migrate
```

Aktuális sémán nincs migrációs módosítás. Production környezetben az API nem futtat automatikus migrációkat. Új migráció készítése `dotnet-ef` eszközzel:

```sh
dotnet ef migrations add MigrationName --project backend/SpecHub.Api
```

Külső adatbázis connection stringje a terminálból felülírható a `ConnectionStrings__DefaultConnection` környezeti változóval. A közös indító ilyenkor is elindítja a helyi Compose adatbázist.

## Backend felépítése

```text
backend/SpecHub.Api/
  Controllers/       # HTTP-végpontok és válaszkódok
  Services/          # sablonverziók és tulajdonosi ellenőrzések
  Repositories/      # EF Core lekérdezések és mentés
  Domain/            # adatbázis-entitások
  DTOs/              # API-szerződések és domain konverziók
  Data/AppDbContext.cs
  Migrations/
  Program.cs         # DI, JWT, OpenAPI, dev migrációk, healthcheck
frontend/
  src/editor/        # dokumentumszerkesztő és állapotkezelés
  src/api/           # API-kliens és dokumentumséma
SpecHub.slnx
```

A dokumentumok és dokumentumsablonok kulcsa `(Id, Version)`; a modulok egyes mezői PostgreSQL `jsonb` mezők. A vezérlő → service → repository felosztás már elkülöníti a HTTP-, üzleti és adatbázisréteget.

Elérhető végpontok a kiírt backend URL-en:

| Végpont | Funkció |
|---|---|
| `GET /health` | Adatbázis-kapcsolat; hiba esetén 503 |
| `GET /api/health` | API életjel, adatbázis-lekérdezés nélkül |
| `GET /api/users` | Felhasználók listája |
| `GET /api/template?userId=...` | Felhasználó sablonjai |
| `/api/template` | Sablonlekérés, létrehozás, verziózás, törlés |
| `/openapi/v1.json`, `/swagger` | Development API-dokumentáció |

Development módban HTTP-t használunk; Production módban megmarad a HTTPS-átirányítás.

Jelenlegi korlátok: a szerkesztő még mock dokumentumot tölt be; a JWT-konfiguráció mellett nincs kész bejelentkezési folyamat, és a sablonkezelés a kérésben kapott `userId`-ra támaszkodik. Élesítés előtt az azonosítót hitelesített JWT claimből kell venni, és a fejlesztői JWT-kulcsot le kell cserélni.

## További ellenőrzések

```sh
dotnet build SpecHub.slnx
npm --prefix frontend run build
npm --prefix frontend test
```
