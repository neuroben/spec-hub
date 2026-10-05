# Module DTO

## CREATE

### Create Module DTO

```json
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
```

## UPDATE

### Update Module DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
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
```

## DELETE

### Delete Module DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
}
```

## READ

### Module DTO

```json
{
    "id":"5cac597a-cbcd-465a-815b-37670fdc541c",
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

```