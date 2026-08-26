from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://ztz_local:ztz_local_password@db:5432/ztz_passes"
    demo_logist_username: str = "logist"
    demo_logist_password: str = "Logist-Local-2026!"
    demo_admin_username: str = "admin"
    demo_admin_password: str = "Admin-Local-2026!"
    session_ttl_hours: int = 12
    cookie_secure: bool = False
    public_base_url: str | None = None
    app_timezone: str = "Europe/Moscow"

    @field_validator("public_base_url", mode="before")
    @classmethod
    def normalize_public_base_url(cls, value: object) -> object:
        if value is None or str(value).strip() == "":
            return None
        return str(value).strip().rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()

