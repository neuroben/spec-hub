# Document szolgáltatás – működési specifikáció

## Cél és hatókör

A dokumentum szolgáltatás dokumentumok létrehozását, lekérdezését, módosítását és törlését kezeli egy kiválasztott dokumentumsablon adott verziója alapján. A dokumentum a sablon moduljait viszi tovább, de a modulokhoz felelős felhasználók is rendelhetők.

Ez a leírás a szolgáltatás elvárt viselkedését rögzíti. A meglévő dokumentum DTO-k és végpontok ezt még nem feltétlenül valósítják meg.

## Alapfogalmak

- **Készítő (`created_by`)**: a dokumentumot létrehozó felhasználó. A szerver állítja be, és a dokumentum teljes élettartama alatt változatlan.
- **Modulfelelős (`owners`)**: a modulhoz rendelt felhasználó. A felelősök létrehozáskor megadhatók, később a jogosultsági szabályok szerint módosíthatók.
- **Modulazonosító**: a modulhoz a dokumentum létrehozásakor egyszer kiosztott, belső és stabil azonosító. Nem a megjelenítési sorrendet jelöli; átrendezéskor és a modul későbbi módosításakor változatlan marad.
- **Sablon**: csak létrehozáskor használatos forrás. A dokumentum létrehozáskor önálló snapshotként eltárolja a modulok és komponensek teljes állapotát; utána nincs sablonhivatkozása.
- **Szerkezet**: a modulok és komponenseik típusai, valamint az egyes komponensek paramétereinek mezői. A modulok sorrendje és darabszáma külön kezelhető.

## Létrehozás

1. A `POST /api/Documents` JSON törzse a címet és a modulokat adja meg. A sablonazonosító (`templateId`) és sablonverzió (`templateVersion`) query paraméter; ezeket nem a JSON törzsben kell elküldeni. Update kérésben nem kell sablonadatot küldeni.
2. A szolgáltatás ellenőrzi, hogy a megadott sablon és verzió létezik.
3. A létrejövő dokumentum szerkezete a megadott sablonverzió szerkezetével egyezzen meg. A komponens- és paraméterséma, illetve a komponensek modulon belüli felépítése nem alakítható át.
4. A modulok sorrendje és darabszáma módosítható a másolási szabályok szerint. Egy sablonmodul egyszer használható fel; további példánya csak akkor adható hozzá, ha a sablonmodul `parameters.can_copy` értéke `true`. Minden példánynak külön `module_id` jár. Új, sablonban nem szereplő modultípus vagy komponens nem vezethető be.
5. A modulazonosítót a kliens nem adja meg. Létrehozáskor a szolgáltatás kioszt egyedi azonosítót minden modulnak. Az azonosító a dokumentumon belüli modulpéldányt azonosítja, és átrendezéskor vagy további módosításkor nem változik.
6. Create kérésben a `comments` mező kötelező, értéke üres tömb. Modulonként több felelős (`owners`) is megadható. A hivatkozott felhasználók létezését ellenőrizni kell.
7. Komponensparaméterek `content` mezője csak akkor térhet el a sablonban rögzített értéktől, ha az adott komponens `editable` értéke `true`. `editable: false` esetén a beküldött eltérő tartalmat a szolgáltatás utasítsa el `400 Bad Request` válasszal. A kliens nem teheti szerkeszthetővé a mezőt az `editable` érték átírásával.
8. A `created_by`, `created_at`, kezdő `version` és `last_modified` értékeket a szerver állítja be. A kliens nem választhatja meg a készítőt.

## Módosítás

1. A módosítás a dokumentum aktuális snapshotjából indul, és a készítő, létrehozási idő változatlan marad.
2. A készítő nem módosítható: a kérés nem tartalmazhatja felülírható mezőként, illetve ha mégis tartalmazza, a szerver figyelmen kívül hagyja vagy elutasítja.
3. Update kérésben nem kell sablonazonosítót vagy sablonverziót küldeni; a sablont csak létrehozáskor választja ki a kliens. A dokumentum moduljai a létrehozott példányban rögzített szerkezetet adják. A modulok és komponensek szerkezete nem módosítható. A modulok sorrendje és darabszáma igen. A stabil modulazonosító nem változtatható meg, nem cserélhető fel másik modul azonosítójával. Egy kérésben ugyanaz a nem üres `module_id` legfeljebb egyszer fordulhat elő.
4. A `content` mező kizárólag akkor változhat, ha az eredeti, sablonverzióban rögzített megfelelő mező `editable: true`. A kérésben érkező `editable` érték nem használható a jogosultság vagy szerkeszthetőség megkerülésére.
5. A többi paraméter és mező módosíthatóságát a sablon által megengedett struktúra határozza meg; a jelen specifikáció kifejezetten a `content` mező szerkeszthetőségét korlátozza.
6. Új kommentet update kérés sem adhat hozzá. Meglévő kommenthivatkozás megtartható; új hivatkozást a document szolgáltatás nem fogad el.
7. Ha a cím és a modulok (beleértve a sorrendet, felelősöket és mezőértékeket) nem változtak, a módosítás idempotens: nem készül új verzió, és a meglévő dokumentum kerül visszaadásra. Tényleges változáskor a verzió növekszik, a `last_modified` a szerveridőre áll, a `created_by` és `created_at` változatlan marad.

## Modul másolása

- Másolt modult az update kérés a `module_id` mező nélkül vagy üres azonosítóval jelöl. A szolgáltatás ezt új modulpéldánynak tekinti, és sikeres mentéskor oszt ki neki új, stabil azonosítót.
- Csak olyan modul másolható, amelynek `parameters.can_copy` értéke `true`.
- Másolást a dokumentum készítője vagy a másolandó modul egyik aktuális felelőse kezdeményezhet. A másolás jogosultságát az eredeti, tárolt modul felelősei alapján kell ellenőrizni.
- Új modulpéldány `comments` mezője üres tömb kell legyen.

## Modulfelelősök módosítása és jogosultság

Minden módosítási kérésnél a szolgáltatás a hitelesített/kéréshez tartozó felhasználó azonosítóját használja, és a módosítás előtt ellenőrzi a jogosultságot.

- A dokumentum **készítője** módosíthatja a dokumentumot, ideértve a modulfelelősök módosítását is.
- Egy adott modul **bármely jelenlegi felelőse** módosíthatja az adott modult, ideértve a modul címét és felelőseinek listáját is.
- A modulfelelős hozzáadhat új felelőst a saját moduljához, eltávolíthat egy vagy több felelőst, és saját magát is eltávolíthatja. Több owner egyszerre is megmaradhat.
- Egy modul felelőse nem módosíthat más modulokat vagy dokumentumszintű mezőket (például a dokumentum címét), kivéve, ha egyben a dokumentum készítője is.
- Ha egy kérés több modult érint, a készítő jogosult az egész kérésre. Más felhasználó csak akkor jogosult, ha minden érintett modulnak jelenlegi felelőse; ellenkező esetben a kérés egésze sikertelen legyen, részleges mentés ne történjen.
- A felelősi jogosultságot a tárolt, módosítás előtti owners lista alapján kell ellenőrizni. Az újonnan megadott felelős önmagában nem ad jogosultságot a kérés kezdeményezőjének.
- Ha egy modulnak nincs felelőse, annak tartalmát csak a dokumentum készítője módosíthatja.

A jogosultság ellenőrzése a tárolt, módosítás előtti állapot alapján történjen. Így egy nem jogosult felhasználó nem adhat magának jogosultságot azzal, hogy saját azonosítóját előbb az `owners` listába írja.

## Lekérdezés

- A lista nézet adja vissza legalább az azonosítót, címet, sablon- és dokumentumverziót, készítőt, létrehozási és utolsó módosítási időt.
- A részletes nézet a modulokat, paramétereket, felelősöket, meglévő kommenthivatkozásokat és komponenseket is tartalmazza.
- A kimeneti DTO-k a `created_by` mezőt a tényleges készítővel töltsék fel, ne üres vagy kliens által megadott értékkel.

## Törlés

A dokumentum törlése csak a dokumentum készítőjének engedélyezett. A modulfelelősi jogosultság önmagában nem jogosít fel a teljes dokumentum törlésére.

## Várható hibák

- `404 Not Found`: a dokumentum vagy a kért sablonverzió nem található.
- `400 Bad Request`: hibás vagy a sablonszerkezettel össze nem egyeztethető modul-/komponensadat, ismeretlen felelős, illetve nem szerkeszthető `content` megváltoztatásának kísérlete.
- `403 Forbidden`: a felhasználó nem a dokumentum készítője, és nem felelőse minden olyan modulnak, amelyet módosítani próbál.
- `409 Conflict` (ha a verzió alapú ütközésvédelem része az API-nak): a kliens elavult dokumentumverziót módosít.

## Nyitott szerződéses döntések

1. A felhasználói azonosító jelenlegi API-ban query paraméterként érkezik (`userId`). A user kezelés kialakításáig ezt használjuk a jogosultság-ellenőrzéshez. Később hitelesített felhasználói kontextusból kell származtatni.
