from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "OPU Checklist API"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"
    database_url: str = "postgresql+psycopg://opu_user:opu_password@localhost:5432/opu_checklist"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    uploads_dir: str = str(BASE_DIR / "uploads")
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_subject: str = "mailto:no-reply@example.com"
    auto_create_schema: bool = False

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


settings = Settings()
