from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: str = "postgresql+asyncpg://dev:dev@localhost:5432/filestorage"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "cachette-files-459653582452"

settings = Settings()