from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Bid Out API"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    database_url: str

    # Email config
    mail_username: str = "your_email@gmail.com"
    mail_password: str = "your_app_password"
    mail_from: str = "your_email@gmail.com"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False


settings = Settings()
