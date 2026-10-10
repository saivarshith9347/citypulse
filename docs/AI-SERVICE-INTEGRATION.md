# AI Service Integration Guide

## Overview

This document explains how the Python AI service integrates with the CityPulse Next.js application and Supabase database.

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        CityPulse System                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌────────────┐         ┌─────────────┐         ┌─────────┐│
│   │   Bus      │────────>│  AI Service │────────>│Supabase ││
│   │  Camera    │  Video  │  (Python)   │ Incidents│Database ││
│   └────────────┘         └─────────────┘         └─────────┘│
│                                 │                      │      │
│                                 │Evidence Images       │      │
│                                 v                      v      │
│                          ┌─────────────┐         ┌─────────┐│
│                          │   Storage   │         │Next.js  ││
│                          │  (Local/S3) │<────────│Dashboard││
│                          └─────────────┘         └─────────┘│
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Video Submission
```
Bus/Operator → AI Service (/api/process-video)
- Uploads video file (MP4/AVI/MOV/MKV)
- Provides bus ID (optional)
- Specifies GPS mode (simulated or track)
```

### 2. Video Processing
```
AI Service:
1. Validates file (type, size)
2. Saves to uploads/
3. Processes frames with OpenCV
4. Runs YOLO detection on sampled frames
5. Aggregates detections into events
6. Assigns GPS coordinates
7. Saves evidence images to output/evidence/
```

### 3. Event Generation
```
For each significant detection group:
- event_id: UUID
- bus_id: Bus identifier
- event_type: vehicle, congestion, pothole, etc.
- severity: low, medium, high, critical
- confidence: 0.0-1.0
- latitude, longitude: GPS coordinates
- timestamp: Detection time
- evidence_path: Path to evidence image
- is_simulated: Boolean flag
- metadata: Additional info
```

### 4. Database Persistence
```
AI Service → Supabase (incidents table):
- Validates event data
- Converts confidence to percentage
- Sets verification_status to "detected"
- Inserts incident record
- Returns incident ID
```

### 5. Dashboard Display
```
Next.js → Supabase (query incidents):
- Fetches incidents with filters
- Displays on map with markers
- Shows in incident table
- Allows status updates
```

### 6. Verification Workflow
```
Operator → Dashboard:
1. Views incident details
2. Reviews evidence image
3. Updates status: verified/rejected
4. Adds description/notes
5. Creates work order (if verified)
```

### 7. Work Order Management
```
Dashboard → Supabase:
1. Creates work order
2. Assigns to department
3. Sets priority
4. Updates incident status to "assigned"
5. Tracks through completion
```

## API Communication

### AI Service Endpoints

**Health Check**:
```http
GET http://localhost:8000/health

Response 200:
{
  "status": "healthy",
  "models": {...},
  "database": "connected"
}
```

**Process Video**:
```http
POST http://localhost:8000/api/process-video
Content-Type: multipart/form-data

Form Data:
- video: file
- bus_id: string (optional)
- use_simulated_gps: boolean
- simulated_latitude: float
- simulated_longitude: float

Response 200:
{
  "job_id": "uuid",
  "status": "completed",
  "detections_count": 150,
  "events_created": 5,
  "processing_time_seconds": 12.5,
  "events": [...],
  "warnings": ["Using simulated GPS coordinates"]
}
```

### Next.js API Endpoints

**Get Incidents**:
```http
GET http://localhost:3000/api/incidents?verification_status=detected

Response 200:
{
  "incidents": [...],
  "count": 25
}
```

**Update Incident**:
```http
PATCH http://localhost:3000/api/incidents/{id}
Content-Type: application/json

{
  "verification_status": "verified",
  "description": "Confirmed pothole"
}

Response 200:
{
  "incident": {...}
}
```

**Create Work Order**:
```http
POST http://localhost:3000/api/work-orders
Content-Type: application/json

{
  "incident_id": "uuid",
  "department_id": "uuid",
  "priority": "high",
  "status": "pending"
}

Response 201:
{
  "workOrder": {...}
}
```

## Database Schema Integration

### Incidents Table
```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,  -- matches AI service event_type
  severity TEXT NOT NULL,    -- low/medium/high/critical
  confidence DECIMAL(5,2),   -- 0.00-100.00
  latitude DECIMAL(10,7),    -- from AI service
  longitude DECIMAL(10,7),   -- from AI service
  detected_at TIMESTAMPTZ,   -- from AI service
  bus_id UUID REFERENCES buses(id),
  evidence_path TEXT,        -- from AI service
  verification_status TEXT DEFAULT 'detected',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Service Event → Database Incident
```python
# AI Service
event = DetectionEvent(
    event_id="abc123",
    event_type="congestion",
    severity=Severity.HIGH,
    confidence=0.85,
    latitude=19.0760,
    longitude=72.8777,
    timestamp=datetime.utcnow(),
    evidence_path="./output/evidence/image.jpg"
)

# Converted to Supabase insert
incident_data = {
    "event_type": "congestion",
    "severity": "high",
    "confidence": 85.0,  # percentage
    "latitude": 19.0760,
    "longitude": 72.8777,
    "detected_at": "2026-10-09T12:00:00Z",
    "evidence_path": "./output/evidence/image.jpg",
    "verification_status": "detected"
}
```

## Environment Configuration

### AI Service (.env)
```bash
# Must match Next.js Supabase config
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_KEY=service-role-key

# AI specific
MIN_CONFIDENCE=0.50
VEHICLE_MODEL=yolov8n.pt
VEHICLE_DETECTION_ENABLED=true
ROAD_DAMAGE_DETECTION_ENABLED=false
```

### Next.js (.env.local)
```bash
# Public (browser)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key

# Server-only
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# AI Service URL (optional, for future direct integration)
AI_SERVICE_URL=http://localhost:8000
```

## Security

### Authentication
- **AI Service**: No auth in Phase 1 (trusted internal network)
- **Next.js**: Uses Supabase Auth (to be implemented)
- **Database**: Row Level Security policies

### Data Validation
- **AI Service**: Pydantic models validate all inputs
- **Next.js**: Zod schemas validate API requests
- **Database**: CHECK constraints and triggers

### Secrets Management
- Never log SUPABASE_SERVICE_KEY
- Never expose in API responses
- Use environment variables only
- Rotate keys regularly

## Testing the Integration

### 1. Start Services
```bash
# Terminal 1: Next.js
cd /path/to/CITYPULSE
npm run dev

# Terminal 2: AI Service
cd /path/to/CITYPULSE/ai-service
source venv/bin/activate
python -m app.main
```

### 2. Health Checks
```bash
# AI Service
curl http://localhost:8000/health

# Next.js
curl http://localhost:3000/api/health
```

### 3. Upload Test Video
```bash
curl -X POST http://localhost:8000/api/process-video \
  -F "video=@test.mp4" \
  -F "bus_id=TEST-001" \
  -F "use_simulated_gps=true" \
  -F "simulated_latitude=19.0760" \
  -F "simulated_longitude=72.8777"
```

### 4. Verify Incidents in Database
```bash
# Check Supabase Table Editor
# Or via Next.js API
curl http://localhost:3000/api/incidents
```

### 5. View in Dashboard
```
Open: http://localhost:3000/dashboard/map
- Should see incident markers
- Click marker to view details
```

### 6. Verify Incident
```bash
# Get incident ID from map
curl -X PATCH http://localhost:3000/api/incidents/{id} \
  -H "Content-Type: application/json" \
  -d '{"verification_status": "verified"}'
```

### 7. Create Work Order
```
In Dashboard:
1. Click incident
2. Update status to "verified"
3. Click "Create Work Order"
4. Select department
5. Submit
```

## Common Integration Issues

### Issue: AI Service Can't Connect to Database
**Symptoms**: Warnings in AI service logs, events not persisted
**Solution**: 
- Check SUPABASE_URL and SUPABASE_SERVICE_KEY in ai-service/.env
- Verify Supabase project is not paused
- Test connection: `curl http://localhost:8000/health`

### Issue: Incidents Not Appearing on Map
**Symptoms**: AI service creates events but dashboard shows no markers
**Solution**:
- Check incidents table in Supabase has data
- Verify Next.js can query Supabase: `curl http://localhost:3000/api/incidents`
- Check browser console for API errors
- Ensure incidents have valid lat/lng coordinates

### Issue: Evidence Images Not Displaying
**Symptoms**: Incident shows but evidence_path is broken
**Solution**:
- AI service saves images locally (not accessible to Next.js)
- For production: upload evidence to Supabase Storage or S3
- Update evidence_path to public URL
- Or serve via AI service static endpoint

### Issue: GPS Coordinates Invalid
**Symptoms**: Incidents created but lat/lng are null or out of range
**Solution**:
- Verify simulated coordinates are valid (-90 to 90, -180 to 180)
- Check GPS track format if using real coordinates
- Ensure use_simulated_gps is set correctly

### Issue: Duplicate Incidents
**Symptoms**: Same detection creates multiple database records
**Solution**:
- AI service batches detections per video
- Each video should be processed once
- Add deduplication logic based on location+time
- Use database unique constraints

## Production Deployment

### AI Service Deployment

**Option 1: Docker Container**
```bash
cd ai-service
docker build -t citypulse-ai .
docker run -p 8000:8000 --env-file .env citypulse-ai
```

**Option 2: Cloud VM**
```bash
# Install Python 3.9+
# Clone repository
# Install dependencies
# Configure environment
# Run with systemd or supervisor
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Option 3: Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: citypulse-ai
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: ai-service
        image: citypulse-ai:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: citypulse-secrets
```

### Next.js Deployment

**Vercel** (Recommended):
```bash
# Connect GitHub repository
# Configure environment variables
# Deploy automatically on push
```

**Alternative: Docker**
```bash
docker build -t citypulse-web .
docker run -p 3000:3000 citypulse-web
```

### Evidence Storage

**Development**: Local filesystem
**Production**: Cloud storage (S3, Supabase Storage, Cloudinary)

Update AI service to upload evidence:
```python
# Upload to Supabase Storage
storage_client = supabase.storage.from_('evidence')
with open(evidence_path, 'rb') as f:
    storage_client.upload(f'incidents/{event_id}.jpg', f)
public_url = storage_client.get_public_url(f'incidents/{event_id}.jpg')
```

## Future Enhancements

### Real-time Processing
- Stream video instead of upload
- Use WebRTC or RTMP
- Process frames in real-time
- Push events via WebSocket

### GPS Track Import
- Upload GPX file
- Parse GPS coordinates with timestamps
- Match to video frames
- Interpolate between points

### Model Training Interface
- Label tool for road damage
- Fine-tune YOLO on custom data
- A/B test model versions
- Track accuracy metrics

### Advanced Features
- Multi-camera fusion
- 3D road mapping
- Pothole depth estimation
- Automated work order routing
- Predictive maintenance

---

**Last Updated**: 2026-10-09  
**Status**: Phase 1 Complete - Vehicle Detection Operational  
**Next**: Road Damage Model Integration
