"""FastAPI application for CityPulse AI service."""

import logging
import time
import uuid
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import (
    VideoProcessingRequest,
    VideoProcessingResponse,
    HealthResponse,
    GPSCoordinate
)
from app.detector import VideoDetector
from app.database import db_client
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CityPulse AI Service",
    description="Video processing and road damage detection service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector
detector = VideoDetector()


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("Starting CityPulse AI Service")
    logger.info(f"Vehicle detection enabled: {settings.vehicle_detection_enabled}")
    logger.info(f"Road damage detection enabled: {settings.road_damage_detection_enabled}")
    
    # Check database connection
    if db_client.is_connected():
        logger.info("Database connection successful")
    else:
        logger.warning("Database connection failed - events will not be persisted")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    warnings = []
    
    # Check models
    model_info = detector.get_model_info()
    if not model_info["vehicle_detection"]["loaded"]:
        warnings.append("Vehicle detection model not loaded")
    if settings.road_damage_detection_enabled and not model_info["road_damage_detection"]["loaded"]:
        warnings.append("Road damage detection model not loaded")
    
    # Check database
    db_status = "connected" if db_client.is_connected() else "disconnected"
    if db_status == "disconnected":
        warnings.append("Database connection unavailable")
    
    # Determine overall status
    if warnings:
        status = "degraded" if db_status == "connected" else "unhealthy"
    else:
        status = "healthy"
    
    return HealthResponse(
        status=status,
        timestamp=datetime.utcnow(),
        models=model_info,
        database=db_status,
        warnings=warnings
    )


@app.post("/api/process-video", response_model=VideoProcessingResponse)
async def process_video(
    video: UploadFile = File(...),
    bus_id: str = Form(None),
    use_simulated_gps: bool = Form(True),
    simulated_latitude: float = Form(19.0760),
    simulated_longitude: float = Form(72.8777)
):
    """
    Process uploaded video file for object detection.
    
    Args:
        video: Video file to process
        bus_id: Optional bus identifier
        use_simulated_gps: Whether to use simulated GPS coordinates
        simulated_latitude: Simulated latitude (if use_simulated_gps=true)
        simulated_longitude: Simulated longitude (if use_simulated_gps=true)
    
    Returns:
        Processing results with detections and events
    """
    job_id = str(uuid.uuid4())
    start_time = time.time()
    errors = []
    warnings = []
    
    logger.info(f"Processing video job {job_id}: {video.filename}")
    
    try:
        # Validate file type
        if not video.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        file_ext = Path(video.filename).suffix.lower()
        if file_ext not in settings.supported_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Supported: {', '.join(settings.supported_formats)}"
            )
        
        # Validate file size
        content = await video.read()
        file_size = len(content)
        
        if file_size > settings.max_video_size_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.max_video_size_mb}MB"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Save uploaded video
        video_path = Path(settings.upload_dir) / f"{job_id}_{video.filename}"
        with open(video_path, "wb") as f:
            f.write(content)
        
        logger.info(f"Saved video to {video_path} ({file_size / 1024 / 1024:.2f}MB)")
        
        # Prepare GPS data
        simulated_location = GPSCoordinate(
            latitude=simulated_latitude,
            longitude=simulated_longitude,
            timestamp=datetime.utcnow()
        )
        
        # Process video
        detections, events, proc_warnings = detector.process_video(
            video_path=str(video_path),
            bus_id=bus_id,
            gps_track=None,  # No real GPS track in Phase 1
            use_simulated_gps=use_simulated_gps,
            simulated_location=simulated_location
        )
        
        warnings.extend(proc_warnings)
        
        # Persist events to database
        events_created = 0
        if events and db_client.is_connected():
            try:
                incident_ids = db_client.batch_create_incidents(events)
                events_created = len(incident_ids)
                logger.info(f"Created {events_created} incidents in database")
            except Exception as e:
                logger.error(f"Failed to persist events: {e}")
                errors.append(f"Database persistence failed: {str(e)}")
        elif events:
            warnings.append("Database unavailable - events not persisted")
        
        processing_time = time.time() - start_time
        
        return VideoProcessingResponse(
            job_id=job_id,
            status="completed",
            detections_count=len(detections),
            events_created=events_created,
            processing_time_seconds=processing_time,
            detections=detections[:100],  # Limit response size
            events=events,
            warnings=warnings,
            errors=errors
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Video processing failed: {e}", exc_info=True)
        processing_time = time.time() - start_time
        
        return VideoProcessingResponse(
            job_id=job_id,
            status="failed",
            detections_count=0,
            events_created=0,
            processing_time_seconds=processing_time,
            detections=[],
            events=[],
            warnings=warnings,
            errors=[str(e)]
        )


@app.get("/api/models")
async def get_models():
    """Get information about available models."""
    return detector.get_model_info()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "CityPulse AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "process_video": "/api/process-video",
            "models": "/api/models"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.service_host,
        port=settings.service_port,
        reload=True
    )
