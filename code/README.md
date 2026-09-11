# Code

Исполняемый код приложения.

## Компоненты

- `app/backend/` — FastAPI-приложение, SQLAlchemy-модели, Alembic-миграции, backend-тесты и smoke-тест.
- `app/frontend/` — статический Nginx frontend: страницы водителя, входа и кабинета, CSS, i18n и browser-логика.

Compose собирает эти два компонента как самостоятельные контейнеры. Внешний proxy и deployment-шаблоны находятся в `deploy/`.
