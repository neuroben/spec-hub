# Document template DTO

A sablonmodulok JSON-struktúrájában az `owners` és `comments` mező kötelező, értékük kizárólag üres tömb lehet. Nem üres listával küldött kérés `400 Bad Request` választ eredményez. A részletes válasz is tartalmazza mindkét mezőt üres tömbként.

Dokumentum létrehozásakor a kiválasztott sablon ellenőrzi és inicializálja a modulok szerkezetét. A létrejött dokumentum önálló snapshotot tárol, később nem hivatkozik a sablonra; a sablon ezután törölhető vagy módosítható a dokumentumok befolyásolása nélkül.

## CREATE

### Create document template DTO

```json
{
    "title": "Title of Document",
    "modules": [
        {
            "title":"Ez egy modul",
            "parameters": 
                {
                    "can_copy": true,
                    "color": "",
                    "margin": [1,2],
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
                        "content": "We value your privacy"
                    }
                },
                {
                    "type": "paragraph",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "We value your privacy"
                    }
                },
                {
                    "type": "true_false",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "Is there IBO problem?",
                        "answer": true 
                    }
                },
                {
                    "type": "true_false",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "Is there IBO problem?",
                        "answer": false
                    }
                }
            ]
        }
    ]
}
```

## UPDATE

### Update document template DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
    "title": "Title of Document",
    "modules": [
        {
            "title":"Ez egy modul",
            "parameters": 
                {
                    "can_copy": true,
                    "color": "",
                    "margin": [1,2],
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
                        "content": "We value your privacy"
                    }
                },
                {
                    "type": "paragraph",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "We value your privacy"
                    }
                },
                {
                    "type": "true_false",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "Is there IBO problem?",
                        "answer": true 
                    }
                },
                {
                    "type": "true_false",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "Is there IBO problem?",
                        "answer": false
                    }
                }
            ]
        }
    ]
}
```

## DELETE

### Delete document template DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
}
```

## READ

### Document Templates List DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
    "title": "Title of Document",
    "version": 1,
    "created_at":"1999-01-08",
    "created_by":"",
    "last_modified":"1999-01-08"
}
```

### Document Template Details DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
    "title": "Title of Document",
    "version": 1,
    "created_at":"1999-01-08",
    "created_by":"",
    "last_modified":"1999-01-08",
    "modules": [
        {
            "title":"Ez egy modul",
            "parameters": 
                {
                    "can_copy": true,
                    "color": "",
                    "margin": [1,2],
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
                        "content": "We value your privacy"
                    }
                },
                {
                    "type": "paragraph",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "We value your privacy"
                    }
                },
                {
                    "type": "true_false",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "Is there IBO problem?",
                        "answer": true 
                    }
                },
                {
                    "type": "true_false",
                    "params": {
                        "color": "red",
                        "editable": true,
                        "content": "Is there IBO problem?",
                        "answer": false
                    }
                }
            ]
        }
    ]
}
```
