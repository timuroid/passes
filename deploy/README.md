# Серверное развёртывание

## Что передать на сервер

Весь репозиторий. Реальные секреты в Git не добавляются: создайте `deploy/.env.production` из `.env.production.example`, сохраните его в Infisical или другом защищённом хранилище и подставьте на сервере.

Фронтенд — статический Nginx-контейнер, поэтому отдельного runtime `.env` у него нет. `APP_PORT` в общем файле окружения — его единственная серверная настройка. Остальные значения относятся к Compose, PostgreSQL и backend.

Миграции уже выделены в `project_files/app/backend/alembic/versions/`. При каждом запуске backend сам выполняет `alembic upgrade head`; вручную менять БД или запускать SQL не требуется.

## Запуск

```bash
cp deploy/.env.production.example deploy/.env.production
# Заполнить CHANGE_ME безопасными уникальными значениями
docker compose --env-file deploy/.env.production up --build -d
docker compose ps
```

`APP_PORT=127.0.0.1:18080` не открывает сервис напрямую в интернет: его принимает внешний Nginx на сервере.

## Домен и TLS

1. Выберите свободный поддомен `*.intbis.ru`, например `passes.intbis.ru`, и направьте DNS A/AAAA-запись на сервер.
2. Скопируйте `nginx/passes.intbis.ru.conf.example` в конфигурацию Nginx, заменив домен.
3. Выпустите бесплатный публичный сертификат Let's Encrypt (Certbot/инструмент Timeweb). Самоподписанный сертификат не использовать.
4. В `deploy/.env.production` задайте тот же HTTPS-адрес в `PUBLIC_BASE_URL` и оставьте `COOKIE_SECURE=true`.

Внешний Nginx обязательно передаёт `Host` и `X-Forwarded-Proto: https`; это необходимо для same-origin/CSRF-проверки backend. Для SSE отключена буферизация и увеличен timeout.

## После запуска

```bash
curl -fsS https://passes.intbis.ru/api/health
```

Настройте резервное копирование named volume PostgreSQL. Не используйте `docker compose down -v`, если данные должны сохраниться.
