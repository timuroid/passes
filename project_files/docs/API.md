# HTTP API

Base path: `/api`. Формат запросов и ответов — JSON, кроме SSE и QR SVG. Интерактивная OpenAPI-схема доступна по `/api/docs`.

## Аутентификация

### `POST /api/auth/login`

```json
{"username":"logist","password":"Logist-Local-2026!"}
```

При успехе устанавливает HttpOnly session cookie и возвращает пользователя, `csrf_token`, `expires_at`.

### `GET /api/auth/me`

Возвращает текущего пользователя и CSRF-токен. Требует session cookie.

### `POST /api/auth/logout`

Удаляет серверную сессию и cookie. Требует cookie и заголовок `X-CSRF-Token`.

## Публичный поток

### `POST /api/public/passes`

Не требует входа.

```json
{"vehicle_number":"А 123 ВС 77","phone_number":"+7 (999) 123-45-67"}
```

Номер автомобиля нормализуется: внешние/повторные пробелы убираются, буквы переводятся в верхний регистр. `phone_number` обязателен; допускаются 7–15 цифр, пробелы, скобки, дефис и `+`, в ответе он возвращается в нормализованном виде.

### `GET /api/public/driver-qr.svg`

Возвращает `image/svg+xml` с QR-кодом водительской страницы. Цель берётся из `PUBLIC_BASE_URL`, иначе из текущего scheme/Host.

## Заявки

### `GET /api/passes`

Требует роль `logist` или `admin`.

Параметры:

| Параметр | Значения | По умолчанию |
|---|---|---|
| `date_from` | `YYYY-MM-DD` | без нижней границы |
| `date_to` | `YYYY-MM-DD`, включительно | без верхней границы |
| `sort` | `asc`, `desc` | `desc` |
| `page` | целое от 1 | `1` |
| `page_size` | 10–100 | `25` |
| `visibility` | `visible`, `hidden`, `all` | `visible` |
| `search` | часть номера | отсутствует |

Для логиста `visibility` принудительно равен `visible`. Ответ:

```json
{
  "items": [{
    "id": 1,
    "vehicle_number": "А 123 ВС 77",
    "phone_number": "+79991234567",
    "submitted_at": "2026-08-24T09:00:00Z",
    "is_hidden": false,
    "hidden_at": null,
    "hidden_by_user_id": null,
    "restored_at": null
  }],
  "meta": {"page":1,"page_size":25,"total":1,"pages":1,"sort":"desc"}
}
```

### `PATCH /api/passes/{id}/visibility`

Только `admin`; требует `X-CSRF-Token`.

```json
{"hidden":true}
```

`false` восстанавливает запись. Операция не удаляет запись физически.

## Пользователи

### `GET /api/users`

Только `admin`. Возвращает `id`, `username`, `role`, `is_active`, `created_at`; password hash не выдаётся.

### `POST /api/users`

Только `admin`; требует `X-CSRF-Token`. Создаёт активную учётную запись.

```json
{"username":"gate.logist","password":"Gate-Local-2026!","role":"logist"}
```

- `username`: 3–64 символа, латинские буквы, цифры, `.`, `_`, `-`; сохраняется в lowercase;
- `password`: не менее 8 символов, должна быть буква, цифра и специальный символ;
- `role`: `logist` или `admin`.

Пароль сразу преобразуется в Argon2id-хэш и не возвращается в ответе. Повторный логин даёт `409`.

### `PATCH /api/users/{id}/password`

Только `admin`; требует `X-CSRF-Token`. Задаёт новый пароль пользователю и сразу отзывает все его активные сессии.

```json
{"password":"New-Strong-Password-2026!"}
```

Правила пароля совпадают с созданием пользователя. Пароль в ответе API не возвращается. При смене пароля текущего администратора он должен войти заново.

### `PATCH /api/users/{id}/active`

Только `admin`; требует `X-CSRF-Token`.

```json
{"active":false}
```

`false` мягко отключает пользователя и отзывает все его сессии; запись остаётся в `GET /api/users`. Login отключённой записи возвращает `401`. `true` восстанавливает возможность входа. Самоотключение и отключение последнего активного администратора возвращают `409`.

## Realtime

### `GET /api/events`

Требует session cookie. Content type `text/event-stream`. События:

- `ready` — соединение установлено;
- `refresh` — создана заявка или изменена видимость; клиент должен перечитать текущую страницу через `GET /api/passes`.

## Системный endpoint

### `GET /api/health`

Проверяет готовность API и возвращает `{"status":"ok"}`.

## Основные ошибки

- `401` — отсутствующая/истёкшая сессия или неверный пароль;
- `403` — недостаточная роль, чужой Origin или неверный CSRF-токен;
- `404` — заявка не найдена;
- `422` — ошибка валидации/диапазона дат;
- `429` — превышен локальный rate limit.
