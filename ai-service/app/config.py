"""Configuration management for AI service."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Service configuration
    service_host: str = "0.0.0.0"
    service_port: int = 8000
    
    # Supabase configuration
    supabase_url: str
    supabase_service_key: str
    
    # Detection configuration
    min_confidence: float = 0.50
    max_video_size_mb: int = 100
    supported_video_formats: str = ".mp4,.avi,.mov,.mkv"
    frame_sample_rate: int = 30  # Process every Nth frame
    
    # Model configuration
    vehicle_model: str = "yolov8n.pt"
    vehicle_detection_enabled: bool = True
    road_damage_model: str = ""
    road_damage_detection_enabled: bool = False
    
    # Storage configuration
    upload_dir: str = "./uploads"
    output_dir: str = "./output"
    evidence_dir: str = "./output/evidence"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def supported_formats(self) -> List[str]:
        """Get list of supported video formats."""
        return [fmt.strip() for fmt in self.supported_video_formats.split(",")]
    
    @property
    def max_video_size_bytes(self) -> int:
        """Get max video size in bytes."""
        return self.max_video_size_mb * 1024 * 1024
    
    def setup_directories(self):
        """Create necessary directories if they don't exist."""
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)
        Path(self.evidence_dir).mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()
settings.setup_directories()
