# Tech

Техническая документация сервиса: архитектура, HTTP API, структура кода, запуск и эксплуатация.

## Документы

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — компоненты, авторизация, локализация, realtime и ограничения масштабирования.
- [`API.md`](API.md) — публичные и служебные HTTP endpoint'ы, параметры, роли и ответы.

## Запуск и проверки

Из корня проекта:

```bash
docker compose up --build -d
docker compose ps
docker compose exec -T backend pytest -q
docker compose exec -T backend python scripts/smoke_test.py http://127.0.0.1:8000
```

Единственный обязательный способ упаковки — Docker Compose. Frontend и backend собираются из `code/app/frontend` и `code/app/backend`.

## Конфигурация

Локальные значения задаются через `.env` на основе `.env.example`. Серверные значения — через `deploy/.env.production` на основе `deploy/.env.production.example`; реальные секреты в Git не добавляются.
