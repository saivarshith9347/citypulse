"""Pydantic models for request/response validation."""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class EventType(str, Enum):
    """Supported event types."""
    # Vehicle-related (supported by YOLOv8)
    VEHICLE = "vehicle"
    CONGESTION = "congestion"
    
    # Road damage (requires custom model - not yet implemented)
    POTHOLE = "pothole"
    CRACK = "crack"
    FLOODING = "flooding"
    DEBRIS = "debris"


class Severity(str, Enum):
    """Event severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class GPSCoordinate(BaseModel):
    """GPS coordinate with timestamp."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timestamp: datetime
    altitude: Optional[float] = None
    speed: Optional[float] = None


class Detection(BaseModel):
    """Single detection result."""
    class_name: str
    confidence: float = Field(..., ge=0, le=1)
    bbox: List[float] = Field(..., min_length=4, max_length=4)  # [x1, y1, x2, y2]
    frame_number: int
    timestamp: datetime


class VideoProcessingRequest(BaseModel):
    """Request to process a video file."""
    bus_id: Optional[str] = None
    use_simulated_gps: bool = True
    simulated_location: Optional[GPSCoordinate] = None
    
    @field_validator('simulated_location')
    @classmethod
    def validate_simulated_location(cls, v, info):
        """Ensure simulated location is provided if use_simulated_gps is True."""
        if info.data.get('use_simulated_gps') and v is None:
            # Default to Mumbai coordinates if not provided
            return GPSCoordinate(
                latitude=19.0760,
                longitude=72.8777,
                timestamp=datetime.utcnow()
            )
        return v


class DetectionEvent(BaseModel):
    """Structured detection event for database persistence."""
    event_id: str
    bus_id: Optional[str]
    event_type: str  # Use string instead of EventType to allow any class
    severity: Severity
    confidence: float = Field(..., ge=0, le=1)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timestamp: datetime
    evidence_path: Optional[str] = None
    description: str
    is_simulated: bool = False
    metadata: Optional[dict] = None


class VideoProcessingResponse(BaseModel):
    """Response from video processing."""
    job_id: str
    status: Literal["processing", "completed", "failed"]
    detections_count: int
    events_created: int
    processing_time_seconds: float
    detections: List[Detection]
    events: List[DetectionEvent]
    warnings: List[str] = []
    errors: List[str] = []


class HealthResponse(BaseModel):
    """Health check response."""
    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    version: str = "1.0.0"
    models: dict
    database: str
    warnings: List[str] = []
