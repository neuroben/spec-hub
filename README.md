# SpecHub — projekt váz
# React (Vite, plain) + .NET 10 REST API + PostgreSQL 18

## Struktúra

```text
spec-hub/
  frontend/            # React 19 + Vite 8 + TS (plain React, nincs framework)
    src/api/client.ts  # backend hívások (/api/*)
  backend/
    SpecHub.Api/       # .NET 10 Web API (Controllers, EF Core + Npgsql)
      Controllers/
      Data/AppDbContext.cs
  docker-compose.yml   # postgres:18-alpine
  SpecHub.sln
```

## Előfeltételek

- Node 22+ / npm 11+
- .NET SDK 10+
- Docker + Docker Compose
- (opcionális) `dotnet-ef` migrációkhoz

## Gyors indítás

### 1. Adatbázis (Postgres 18)

```bash
cp .env.example .env        # Win: copy .env.example .env
docker compose up -d db
```

Kapcsolat alapértelmezetten:
`Host=localhost;Port=5432;Database=spechub;Username=spechub;Password=spechub`

### 2. Backend (.NET REST API)

```bash
dotnet restore
dotnet run --project backend/SpecHub.Api
```

- API: http://localhost:5117
- Health: `GET /health` (DB-vel) és `GET /api/health` (egyszerű)
- Példa: `GET /api/weatherforecast`
- OpenAPI (Dev): http://localhost:5117/openapi/v1.json
- Swagger: http://localhost:5117/swagger

Connection string felülírása env-vel:

```bash
# PowerShell
$env:ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=spechub;Username=spechub;Password=spechub"
dotnet run --project backend/SpecHub.Api
```

### 3. Frontend (React)

```bash
cd frontend
cp .env.example .env    # Win: copy .env.example .env
npm install
npm run dev
```

- Dev: http://localhost:5173
- `/api/*` a Vite proxy-n át a backendnek megy (`vite.config.ts`).

Prod build:

```bash
npm run build
```

`VITE_API_URL` üresen hagyva relatív `/api` hívás, élesben állítsd az API URL-re.

## EF Core migrációk (ha kell)

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate --project backend/SpecHub.Api
dotnet ef database update --project backend/SpecHub.Api
```

`Data/AppDbContext.cs`-ben vedd fel a `DbSet`-eket.

## Portok

| Szolgáltatás | Port |
|---|---|
| Frontend (Vite) | 5173 |
| Backend (.NET) | 5117 |
| Postgres | 5432 |
