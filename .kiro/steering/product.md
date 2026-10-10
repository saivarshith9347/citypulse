# Product Overview

## What We're Building

**CityPulse AI** is a Smart India Hackathon 2026 project that transforms public transport buses into mobile sensing units for urban infrastructure monitoring. The system uses AI-powered video analysis to detect road damage (potholes, cracks) and monitor vehicle activity in real-time. Every detection is geo-tagged, timestamped, and routed through municipal maintenance workflows.

## Core Value Proposition

Instead of deploying expensive fixed sensor networks, CityPulse leverages the existing public bus fleet as a distributed monitoring system. Buses continuously capture road conditions across their routes, enabling:

- **Proactive Maintenance**: Detect infrastructure issues before they escalate
- **Data-Driven Resource Allocation**: Prioritize repairs based on severity and location
- **Comprehensive Coverage**: Monitor the entire city through regular bus routes
- **Cost Efficiency**: Reuse existing mobile infrastructure

## Target Users

1. **Municipal Command Center Operators**
   - Monitor live bus fleet and incoming detections
   - Verify AI-flagged incidents
   - Dispatch maintenance teams

2. **Department Supervisors** (Roads, Traffic, Public Works)
   - Review assigned incidents
   - Create and track work orders
   - Generate departmental reports

3. **City Officials & Analysts**
   - View citywide analytics and trends
   - Access historical data and heatmaps
   - Make informed policy decisions

4. **System Administrators**
   - Manage users, roles, and permissions
   - Configure AI thresholds and alert rules
   - Monitor system health

## MVP Modules

### 1. Command Center Dashboard
Real-time overview of the system:
- Live bus locations on map
- Recent detections feed
- Active alerts counter
- System health indicators

### 2. Bus Fleet Monitoring
Track the sensing units:
- Bus location and route tracking
- Online/offline status
- Detection activity per bus
- Camera feed status (simulated for demo)

### 3. Incident Management
Core workflow hub:
- Browse all detected incidents (road damage, traffic violations)
- Filter by type, severity, status, date
- Verify/reject AI detections
- Assign incidents to departments
- Track incident lifecycle (detected → verified → assigned → in_progress → resolved)

### 4. GIS Map & Heatmaps
Spatial visualization:
- Interactive map with all incidents
- Clustered markers for dense areas
- Heatmap overlay for damage concentration
- Route-based filtering
- Temporal playback (show incidents over time)

### 5. Road Damage & Traffic Analytics
Insights and trends:
- Damage distribution by type (pothole, crack, etc.)
- Severity breakdown charts
- Resolution time metrics
- Department performance
- Time-series trend analysis

### 6. Department Assignment & Work Orders
Maintenance workflow:
- Route incidents to responsible departments
- Generate work orders with details
- Track repair progress
- Photo evidence upload (before/after)
- Completion verification

### 7. Python AI Service Integration
Separate AI processing pipeline:
- REST API endpoints for detection requests
- YOLO-based object detection (road damage, vehicles)
- OpenCV image preprocessing
- Confidence scoring
- Bounding box coordinates
- Fallback to simulated data when AI unavailable

## Key Principles

- **Data Integrity**: Clear distinction between AI-detected and human-verified incidents
- **Security First**: RLS policies, role-based access, audit trails
- **Scalable Architecture**: Designed to handle citywide deployment
- **Graceful Degradation**: System works with simulated data when AI service unavailable
- **Mobile Responsive**: Dashboard accessible on tablets in field operations
- **Audit Compliance**: Full history tracking for all incident state changes

## Success Criteria (Demo)

✅ Bus fleet visible on map with simulated movement  
✅ AI detections (real or simulated) appear as incidents  
✅ Incidents can be verified, assigned, and tracked through workflow  
✅ Heatmap shows damage concentration visually  
✅ Analytics dashboard provides actionable insights  
✅ Role-based access working (operator, supervisor, admin)  
✅ System demonstrates integration with Python AI service

## Out of Scope (For MVP)

- Live video streaming from buses (use simulated camera status)
- Mobile app for bus drivers (web-only for now)
- Payment/billing system for contractors
- Historical video archive (store detection snapshots only)
- Multi-city deployment (single city for demo)
- Real-time push notifications (use polling)
