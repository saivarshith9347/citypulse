# CityPulse AI Service

Python-based video processing service for detecting vehicles and road damage using YOLO models.

## Features

### Phase 1 (Implemented)
- ✅ Video file upload and processing
- ✅ Frame sampling with OpenCV
- ✅ YOLOv8 vehicle detection (pretrained)
- ✅ Confidence filtering
- ✅ GPS coordinate association (simulated or timestamped track)
- ✅ Structured event generation
- ✅ Supabase persistence
- ✅ Evidence image extraction
- ✅ Health and detection API endpoints
- ✅ Input validation and error handling

### Phase 2 (Planned)
- ⏳ Road damage detection (requires custom model)
- ⏳ Real-time video streaming
- ⏳ GPS track import (GPX format)
- ⏳ Model fine-tuning interface
- ⏳ Batch processing queue

## Technology Stack

- **FastAPI**: REST API framework
- **OpenCV**: Video processing
- **Ultralytics YOLO**: Object detection (YOLOv8)
- **Supabase**: Database client
- **Pydantic**: Data validation

## Installation

### Prerequisites
- Python 3.9+
- pip or conda
- Supabase project (see main project DATABASE-SETUP.md)

### Steps

1. Navigate to AI service directory:
```bash
cd ai-service
```

2. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

5. Download YOLOv8 model (auto-downloads on first run):
```bash
# Model will auto-download when service starts
# Or manually: wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
```

## Configuration

### Environment Variables

```bash
# Service
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8000

# Supabase (must match main .env.local)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Detection
MIN_CONFIDENCE=0.50
MAX_VIDEO_SIZE_MB=100
FRAME_SAMPLE_RATE=30

# Models
VEHICLE_MODEL=yolov8n.pt
VEHICLE_DETECTION_ENABLED=true
ROAD_DAMAGE_MODEL=
ROAD_DAMAGE_DETECTION_ENABLED=false
```

## Usage

### Start the Service

```bash
# Development mode (auto-reload)
python -m app.main

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Service starts at: http://localhost:8000

### API Endpoints

#### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-09T...",
  "version": "1.0.0",
  "models": {
    "vehicle_detection": {
      "enabled": true,
      "loaded": true,
      "model": "yolov8n.pt",
      "classes": ["person", "bicycle", "car", "motorcycle", "bus", "truck", ...]
    },
    "road_damage_detection": {
      "enabled": false,
      "loaded": false,
      "model": "Not configured",
      "note": "Requires custom trained model"
    }
  },
  "database": "connected",
  "warnings": []
}
```

#### Process Video
```bash
POST /api/process-video
Content-Type: multipart/form-data

Parameters:
- video: Video file (required)
- bus_id: Bus identifier (optional)
- use_simulated_gps: true/false (default: true)
- simulated_latitude: float (default: 19.0760 - Mumbai)
- simulated_longitude: float (default: 72.8777 - Mumbai)
```

Example with curl:
```bash
curl -X POST http://localhost:8000/api/process-video \
  -F "video=@test_video.mp4" \
  -F "bus_id=BUS-001" \
  -F "use_simulated_gps=true" \
  -F "simulated_latitude=19.0760" \
  -F "simulated_longitude=72.8777"
```

Response:
```json
{
  "job_id": "uuid",
  "status": "completed",
  "detections_count": 150,
  "events_created": 5,
  "processing_time_seconds": 12.5,
  "detections": [...],
  "events": [
    {
      "event_id": "uuid",
      "bus_id": "BUS-001",
      "event_type": "congestion",
      "severity": "high",
      "confidence": 0.85,
      "latitude": 19.0765,
      "longitude": 72.8780,
      "timestamp": "2026-10-09T...",
      "evidence_path": "./output/evidence/evidence_abc123_450.jpg",
      "description": "Detected 25 instances of car with 85.00% confidence",
      "is_simulated": true,
      "metadata": {
        "detection_count": 25,
        "frame_range": [450, 600],
        "model": "vehicle"
      }
    }
  ],
  "warnings": ["Using simulated GPS coordinates"],
  "errors": []
}
```

#### Get Models Info
```bash
GET /api/models
```

## Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

### Manual Testing with Sample Video

1. Create or download a test video
2. Upload via API:
```bash
curl -X POST http://localhost:8000/api/process-video \
  -F "video=@sample.mp4" \
  -F "use_simulated_gps=true"
```

3. Check Supabase for created incidents
4. View in Next.js dashboard at http://localhost:3000/dashboard/map

## Vehicle Detection

### Supported Classes (YOLOv8)
The pretrained YOLOv8 model detects 80 classes from COCO dataset. Relevant for CityPulse:

**Vehicles:**
- car
- motorcycle
- bus
- truck
- bicycle

**Road users:**
- person

**Other:**
- traffic light
- stop sign
- parking meter

### Event Generation
Events are generated when:
- ≥3 detections of same class
- Average confidence ≥ MIN_CONFIDENCE
- Detections span multiple frames

**Event Types:**
- `vehicle`: 1-10 vehicles detected
- `congestion`: >10 vehicles detected (high severity if >20)

## Road Damage Detection

### Current Status: ⚠️ NOT IMPLEMENTED

The service is **designed to support** road damage detection, but **does not currently detect** potholes, cracks, or road damage.

### Why Not Implemented?

1. **No Pretrained Model**: YOLOv8's COCO weights don't include road damage classes
2. **Requires Custom Data**: Need labeled dataset of potholes, cracks, flooding, debris
3. **Fine-tuning Needed**: Model must be trained on road-specific imagery

### How to Integrate Road Damage Detection

When a road damage model becomes available:

1. **Obtain trained model**:
   - Train YOLOv8 on labeled road damage dataset
   - Or download pretrained road damage model
   - Save as `road_damage.pt`

2. **Update configuration**:
```bash
ROAD_DAMAGE_MODEL=./models/road_damage.pt
ROAD_DAMAGE_DETECTION_ENABLED=true
```

3. **Supported classes** should include:
   - pothole
   - crack
   - flooding
   - debris

4. **Restart service** - model will auto-load

### Training Your Own Model

Example using Ultralytics:
```python
from ultralytics import YOLO

# Start with pretrained YOLOv8
model = YOLO('yolov8n.pt')

# Train on your dataset
model.train(
    data='road_damage.yaml',  # Dataset config
    epochs=100,
    imgsz=640,
    batch=16
)

# Export trained model
model.export(format='pt')
```

Dataset format (YOLO):
```
road_damage/
  train/
    images/
    labels/
  val/
    images/
    labels/
  road_damage.yaml
```

## GPS Coordinates

### Simulated Mode (Phase 1)
- Uses provided lat/lng as base coordinates
- Adds small random offset per event
- Marks events with `is_simulated: true`
- Suitable for testing and demos

### Real GPS Track (Future)
- Import GPX file with timestamped coordinates
- Match frame timestamps to GPS points
- Interpolate between GPS points if needed
- Marks events with `is_simulated: false`

## Integration with Next.js

### Architecture
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Bus Video  │────────>│ AI Service   │────────>│  Supabase   │
│             │         │ (Python)     │         │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │                         │
                               v                         v
                        ┌──────────────┐         ┌─────────────┐
                        │  Evidence    │         │  Next.js    │
                        │  Images      │<────────│  Dashboard  │
                        └──────────────┘         └─────────────┘
```

### Communication Flow

1. **Video Upload**: Bus or operator uploads video to AI service
2. **Processing**: AI service detects objects, generates events
3. **Persistence**: Events saved to Supabase `incidents` table
4. **Dashboard**: Next.js queries Supabase, displays incidents
5. **Verification**: Operators verify/reject via dashboard
6. **Work Orders**: Verified incidents create work orders

### No Direct Communication
- AI service and Next.js don't communicate directly
- Both connect to Supabase independently
- AI service writes incidents
- Next.js reads/updates incidents

## Error Handling

### Input Validation
- File type validation
- File size limits
- Missing parameters
- Invalid GPS coordinates

### Processing Errors
- Video codec issues
- Model loading failures
- Frame extraction errors
- Detection failures

### Database Errors
- Connection failures (events not persisted, warnings added)
- Invalid data format
- Duplicate submissions (handled by Supabase)

## Security

### Implemented
- ✅ File type validation
- ✅ File size limits
- ✅ No credentials in responses
- ✅ No secrets in logs
- ✅ Input sanitization (Pydantic)
- ✅ CORS configuration

### Recommended for Production
- Add authentication (API keys, JWT)
- Use HTTPS only
- Rate limiting
- File virus scanning
- Audit logging

## Deployment

### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production (Docker)

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY .env .env

# Create directories
RUN mkdir -p uploads output/evidence

# Expose port
EXPOSE 8000

# Run service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t citypulse-ai .
docker run -p 8000:8000 --env-file .env citypulse-ai
```

### Cloud Deployment

**AWS/GCP/Azure**:
- Deploy as container service
- Use managed storage for videos/images
- Connect to Supabase database
- Configure environment variables
- Enable auto-scaling

**Vercel** (Not Recommended):
- Limited to 50MB request size
- 10s execution time limit
- Not suitable for video processing
- Use separate compute service instead

## Troubleshooting

### Model Won't Load
```
Error: Failed to load vehicle model
```
**Solution**: Ensure YOLOv8 weights downloaded or accessible

### Database Connection Failed
```
Warning: Database connection unavailable
```
**Solution**: Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env

### Video Processing Errors
```
Error: Failed to open video
```
**Solution**: Verify video codec, try converting to H.264/MP4

### Out of Memory
```
Error: CUDA out of memory
```
**Solution**: Reduce FRAME_SAMPLE_RATE or use CPU mode

## Performance

### Optimization Tips
1. **Frame sampling**: Increase FRAME_SAMPLE_RATE (process fewer frames)
2. **Model size**: Use yolov8n (nano) for speed, yolov8x for accuracy
3. **Batch processing**: Process multiple frames simultaneously
4. **GPU acceleration**: Enable CUDA if available
5. **Video preprocessing**: Reduce resolution before processing

### Benchmarks (Approximate)
- **yolov8n + CPU**: 5-10 FPS
- **yolov8n + GPU**: 50-100 FPS
- **1-minute video**: 15-30 seconds processing
- **1GB video**: 5-10 minutes processing

## Support

For issues or questions:
1. Check logs: Service logs to console
2. Test health endpoint: `GET /health`
3. Verify Supabase connection
4. Review API documentation above

## License

Part of CityPulse AI project for Smart India Hackathon 2026.
