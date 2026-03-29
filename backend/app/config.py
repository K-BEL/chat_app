from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # LLM Provider Keys
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # TTS Configuration
    tts_model_name: str = "SVECTOR-CORPORATION/Continue-TTS"
    tts_sample_rate: int = 24000
    tts_channels: int = 1
    tts_sample_width: int = 2
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./chat_app.db"
    
    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8080
    debug: bool = False
    
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
