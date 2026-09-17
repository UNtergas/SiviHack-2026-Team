from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):   
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    # default value, to be overwritten in .env
    OLLAMA_URL: str = "http://ollama:11434"
 
    # default value, to be overwritten in .env
    OLLAMA_MODEL: str = "qwen3:8b"

    DATABASE_URL: str = "postgresql+psycopg://postgres:dev@db:5432/router"
    N8N_BASE_URL: str = "http://n8n:5678"
    PROMPT_VERSION: str = "v1"     # bump to invalidate the cache when prompt/categories change

settings = Settings()