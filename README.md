# telegram nazk notification bot

## Description

This bot is designed to notify you about new posts on **https://public.nazk.gov.ua/** with predefined filters.
It uses the `cheerio` library to parse HTML content.

## Telegram Bot API

### Webhook

Example of a webhook request:

```{
  "update_id": 164842750,
  "edited_message": {
    "message_id": 49,
    "from": {
      "id": 184909135,
      "is_bot": false,
      "first_name": "first_name",
      "last_name": "last_name",
      "username": "test",
      "language_code": "en"
    },
    "chat": {
      "id": 184909135,
      "first_name": "first_name",
      "last_name": "last_name",
      "username": "test",
      "type": "private"
    },
    "date": 1748659578,
    "edit_date": 1748659586,
    "text": "test message"
  }
}
```
or 
```{
  "update_id": 164842750,
  "message": {
    "message_id": 49,
    "from": {
      "id": 184909135,
      "is_bot": false,
      "first_name": "first_name",
      "last_name": "last_name",
      "username": "username",
      "language_code": "en"
    },
    "chat": {
      "id": 184909135,
      "first_name": "first_name",
      "last_name": "last_name",
      "username": "username",
      "type": "private"
    },
    "date": 1748659578,
    "text": "123"
  }
}
```

