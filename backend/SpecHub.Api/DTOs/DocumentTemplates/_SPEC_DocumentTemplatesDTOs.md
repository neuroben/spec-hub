# Document template DTO

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
            "owners": ["usr.id","usr.id"],
            "comments": ["comment.id","comment.id"],        
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
            "owners": ["usr.id","usr.id"],
            "comments": ["comment.id","comment.id"],        
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
            "owners": ["usr.id","usr.id"],
            "comments": ["comment.id","comment.id"],        
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