# Mentett modulok – API specifikáció

## Cél

A szolgáltatás teljes module JSON objektumokat ment el személyes mentésként a meglévő `ModuleTemplates` táblába. A mentés tulajdonosa az a felhasználó, akinek az azonosítójával a mentési kérés érkezik. A mentő a saját moduljait kilistázhatja, egyenként lekérdezheti és törölheti.

## Alapfogalmak és jogosultság

- **Mentő (`saved_by`)**: a mentés létrehozásakor megadott `userId`. A válasz DTO ezt az értéket `saved_by` néven adja vissza; az adatbázisban a `ModuleTemplates.Owners` JSONB oszlopában, egy elemű listaként tárolódik. A kliens a modul JSON-on belül nem állíthatja.
- A mentett `module` JSON-ban az `owners` és `comments` mező kötelező, mindkettő értéke üres tömb (`[]`). A tulajdonos csak a `ModuleTemplates` rekord adatbázisbeli `Owners` oszlopában szerepel; a modul JSON `owners` mezője üres marad.
- Minden művelet `userId` query paramétert használ. Hiánya vagy üres értéke `400 Bad Request`.
- A lista csak a megadott `userId`-hez tartozó mentéseket adja vissza.
- Részletes lekérdezést és törlést csak a mentés tulajdonosa végezhet. Más felhasználó `403 Forbidden` választ kap.
- Nem létező azonosító `404 Not Found` választ ad.
- A jelenlegi API a `userId` értékét query paraméterből veszi át. A hívó személyazonosságát a hitelesített JWT claimhez kell kötni, mielőtt a rendszer ezt biztonsági határként használja.

## Végpontok

### Mentés

`POST /api/SavedModules?userId={userId}`

Kérés törzse egy `module` nevű JSON objektum. A modul tartalmát a szolgáltatás változtatás nélkül JSON-ként tárolja. A `module` legfelső szintje objektum kell legyen; hiányzó vagy nem objektum érték esetén `400 Bad Request` jár.

```json
{
  "module": {
    "title": "Bevezetés",
    "parameters": {
      "can_copy": true,
      "color": "",
      "margin": [1, 2],
      "frame": {
        "visible": false,
        "color": "red",
        "type": "Dotted",
        "width": "5px",
        "rounded": "5px"
      }
    },
    "owners": [],
    "comments": [],
    "components": [
      {
        "type": "title",
        "params": {
          "color": "black",
          "editable": true,
          "content": "Bevezetés"
        }
      }
    ]
  }
}
```

Sikeres mentés: `201 Created`, a válasz a mentés azonosítóját és metaadatait, valamint az eredeti modult tartalmazza.

```json
{
  "id": "a7bfb01b-feb5-4df5-9583-e91d41c8c02d",
  "module": {
    "title": "Bevezetés",
    "parameters": {
      "can_copy": true,
      "color": "",
      "margin": [1, 2],
      "frame": {
        "visible": false,
        "color": "red",
        "type": "Dotted",
        "width": "5px",
        "rounded": "5px"
      }
    },
    "owners": [],
    "comments": [],
    "components": [
      {
        "type": "title",
        "params": {
          "color": "black",
          "editable": true,
          "content": "Bevezetés"
        }
      }
    ]
  },
  "saved_by": "alice",
  "saved_at": "2026-10-03T12:00:00Z"
}
```

### Saját mentések listázása

`GET /api/SavedModules?userId={userId}`

Sikeres válasz: `200 OK`, a `SavedModuleDto` elemek listája. A sorrend a legújabb mentéstől a legrégebbi felé tart. Üres lista esetén a válasz `[]`.

### Egy mentés lekérdezése

`GET /api/SavedModules/{id}?userId={userId}`

Tulajdonos esetén `200 OK` és a mentés DTO-ja érkezik. Nem létező ID esetén `404 Not Found`, más tulajdonos mentésének lekérdezésekor `403 Forbidden` a válasz.

### Mentés törlése

`DELETE /api/SavedModules/{id}?userId={userId}`

Tulajdonos esetén `204 No Content`. Nem létező ID esetén `404 Not Found`; más felhasználó mentésének törlésére tett kísérlet esetén `403 Forbidden`. A sikertelen törlés nem módosít adatot.

## Tárolt adatok

- `id`: szerver által generált UUID.
- `module`: a beküldött JSON objektum, a `ModuleTemplates` rekord `SavedModuleJson` mezőjében.
- `saved_by`: a mentéshez használt felhasználói azonosító.
- `saved_at`: a mentés szerveroldali, UTC időpontja.

A `ModuleTemplates` táblában a mentett modul sora tulajdonosát az adatbázisbeli `Owners` mező tárolja egy elemű JSON-listaként, a modul JSON `owners` mezője pedig üres tömb marad. A `SavedModuleJson` mező külön jelzi a személyes mentésként létrehozott sorokat, így a lista nem adja vissza az egyéb modul-template sorokat. A működéshez a `ModuleTemplateSavedModuleFields` migrációt alkalmazni kell; ez adja hozzá a `SavedModuleJson` és `SavedAt` oszlopokat.

## Státuszkódok

- `200 OK`: sikeres lekérdezés.
- `201 Created`: sikeres mentés.
- `204 No Content`: sikeres törlés.
- `400 Bad Request`: hiányzó `userId`, hibás vagy nem objektum `module`, illetve ha az `owners` vagy `comments` hiányzik, nem tömb, vagy nem üres tömb.
- `403 Forbidden`: a kérő nem a mentés tulajdonosa.
- `404 Not Found`: nincs mentés a megadott ID-val.
