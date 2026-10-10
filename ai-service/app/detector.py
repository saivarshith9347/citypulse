"""Video detection service using YOLO models."""

import cv2
import uuid
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from ultralytics import YOLO
import logging

from app.models import Detection, DetectionEvent, Severity, GPSCoordinate
from app.config import settings

logger = logging.getLogger(__name__)


class VideoDetector:
    """Video detection using YOLO models."""
    
    def __init__(self):
        """Initialize detector with available models."""
        self.vehicle_model: Optional[YOLO] = None
        self.road_damage_model: Optional[YOLO] = None
        
        # Load vehicle detection model (YOLOv8 pretrained)
        if settings.vehicle_detection_enabled:
            try:
                logger.info(f"Loading vehicle model: {settings.vehicle_model}")
                self.vehicle_model = YOLO(settings.vehicle_model)
                logger.info("Vehicle model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load vehicle model: {e}")
        
        # Load road damage model (if available)
        if settings.road_damage_detection_enabled and settings.road_damage_model:
            try:
                logger.info(f"Loading road damage model: {settings.road_damage_model}")
                self.road_damage_model = YOLO(settings.road_damage_model)
                logger.info("Road damage model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load road damage model: {e}")
    
    def process_video(
        self,
        video_path: str,
        bus_id: Optional[str] = None,
        gps_track: Optional[List[GPSCoordinate]] = None,
        use_simulated_gps: bool = True,
        simulated_location: Optional[GPSCoordinate] = None
    ) -> Tuple[List[Detection], List[DetectionEvent], List[str]]:
        """
        Process video file and detect objects.
        
        Args:
            video_path: Path to video file
            bus_id: Optional bus identifier
            gps_track: Optional list of GPS coordinates with timestamps
            use_simulated_gps: If True, use simulated coordinates
            simulated_location: Base location for simulation
            
        Returns:
            Tuple of (detections, events, warnings)
        """
        detections: List[Detection] = []
        events: List[DetectionEvent] = []
        warnings: List[str] = []
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Failed to open video: {video_path}")
        
        try:
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps if fps > 0 else 0
            
            logger.info(f"Processing video: {total_frames} frames at {fps} FPS ({duration:.2f}s)")
            
            frame_number = 0
            processed_frames = 0
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Sample frames based on frame_sample_rate
                if frame_number % settings.frame_sample_rate == 0:
                    timestamp = datetime.utcnow() + timedelta(seconds=frame_number / fps)
                    
                    # Run vehicle detection if model is available
                    if self.vehicle_model:
                        frame_detections = self._detect_objects(
                            frame, 
                            self.vehicle_model,
                            frame_number,
                            timestamp
                        )
                        detections.extend(frame_detections)
                    
                    # Run road damage detection if model is available
                    if self.road_damage_model:
                        damage_detections = self._detect_objects(
                            frame,
                            self.road_damage_model,
                            frame_number,
                            timestamp
                        )
                        detections.extend(damage_detections)
                    
                    processed_frames += 1
                
                frame_number += 1
            
            logger.info(f"Processed {processed_frames} frames, found {len(detections)} detections")
            
            # Generate events from detections
            events = self._generate_events(
                detections,
                bus_id,
                gps_track,
                use_simulated_gps,
                simulated_location,
                video_path,
                warnings
            )
            
            return detections, events, warnings
            
        finally:
            cap.release()
    
    def _detect_objects(
        self,
        frame,
        model: YOLO,
        frame_number: int,
        timestamp: datetime
    ) -> List[Detection]:
        """Run detection on a single frame."""
        detections = []
        
        try:
            results = model(frame, conf=settings.min_confidence, verbose=False)
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Extract detection info
                    bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    class_name = model.names[class_id]
                    
                    detection = Detection(
                        class_name=class_name,
                        confidence=confidence,
                        bbox=bbox,
                        frame_number=frame_number,
                        timestamp=timestamp
                    )
                    detections.append(detection)
        
        except Exception as e:
            logger.error(f"Detection error on frame {frame_number}: {e}")
        
        return detections
    
    def _generate_events(
        self,
        detections: List[Detection],
        bus_id: Optional[str],
        gps_track: Optional[List[GPSCoordinate]],
        use_simulated_gps: bool,
        simulated_location: Optional[GPSCoordinate],
        video_path: str,
        warnings: List[str]
    ) -> List[DetectionEvent]:
        """Generate structured events from detections."""
        events = []
        
        # Group detections by type for aggregation
        detection_groups = {}
        for det in detections:
            if det.class_name not in detection_groups:
                detection_groups[det.class_name] = []
            detection_groups[det.class_name].append(det)
        
        # Generate events for significant detections
        for class_name, group in detection_groups.items():
            if len(group) < 3:  # Require at least 3 detections for reliability
                continue
            
            # Calculate average confidence
            avg_confidence = sum(d.confidence for d in group) / len(group)
            
            # Use first detection timestamp
            timestamp = group[0].timestamp
            
            # Determine GPS coordinates
            if gps_track:
                # Find closest GPS point by timestamp
                gps_coord = self._find_closest_gps(timestamp, gps_track)
                is_simulated = False
            elif use_simulated_gps and simulated_location:
                # Use simulated coordinates with small random offset
                import random
                gps_coord = GPSCoordinate(
                    latitude=simulated_location.latitude + random.uniform(-0.001, 0.001),
                    longitude=simulated_location.longitude + random.uniform(-0.001, 0.001),
                    timestamp=timestamp
                )
                is_simulated = True
                if not warnings or "simulated GPS" not in str(warnings):
                    warnings.append("Using simulated GPS coordinates")
            else:
                logger.warning("No GPS data available, skipping event generation")
                warnings.append("No GPS data available")
                continue
            
            # Determine event type and severity
            event_type, severity = self._classify_event(class_name, len(group), avg_confidence)
            
            # Save evidence image (first frame of detection)
            evidence_path = self._save_evidence(video_path, group[0].frame_number)
            
            # Create event
            event = DetectionEvent(
                event_id=str(uuid.uuid4()),
                bus_id=bus_id,
                event_type=event_type,
                severity=severity,
                confidence=avg_confidence,
                latitude=gps_coord.latitude,
                longitude=gps_coord.longitude,
                timestamp=timestamp,
                evidence_path=evidence_path,
                description=f"Detected {len(group)} instances of {class_name} with {avg_confidence:.2%} confidence",
                is_simulated=is_simulated,
                metadata={
                    "detection_count": len(group),
                    "frame_range": [group[0].frame_number, group[-1].frame_number],
                    "model": "vehicle" if class_name in ["car", "truck", "bus", "motorcycle"] else "unknown"
                }
            )
            events.append(event)
        
        return events
    
    def _find_closest_gps(
        self,
        timestamp: datetime,
        gps_track: List[GPSCoordinate]
    ) -> GPSCoordinate:
        """Find GPS coordinate closest to given timestamp."""
        if not gps_track:
            raise ValueError("GPS track is empty")
        
        closest = min(
            gps_track,
            key=lambda gps: abs((gps.timestamp - timestamp).total_seconds())
        )
        return closest
    
    def _classify_event(
        self,
        class_name: str,
        count: int,
        confidence: float
    ) -> Tuple[str, Severity]:
        """Classify event type and severity based on detection."""
        # Vehicle-related events
        if class_name in ["car", "truck", "bus", "motorcycle"]:
            # Check for congestion
            if count > 10:
                return "congestion", Severity.HIGH if count > 20 else Severity.MEDIUM
            return "vehicle", Severity.LOW
        
        # Note: Road damage events require custom model
        # These are placeholders for when such a model is integrated
        if class_name in ["pothole", "crack"]:
            if confidence > 0.8:
                return class_name, Severity.HIGH
            return class_name, Severity.MEDIUM
        
        if class_name in ["flooding", "debris"]:
            return class_name, Severity.HIGH
        
        # Default classification
        return class_name, Severity.LOW
    
    def _save_evidence(self, video_path: str, frame_number: int) -> Optional[str]:
        """Extract and save evidence frame from video."""
        try:
            cap = cv2.VideoCapture(video_path)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                evidence_filename = f"evidence_{uuid.uuid4().hex[:8]}_{frame_number}.jpg"
                evidence_path = Path(settings.evidence_dir) / evidence_filename
                cv2.imwrite(str(evidence_path), frame)
                return str(evidence_path)
        
        except Exception as e:
            logger.error(f"Failed to save evidence: {e}")
        
        return None
    
    def get_model_info(self) -> dict:
        """Get information about loaded models."""
        return {
            "vehicle_detection": {
                "enabled": settings.vehicle_detection_enabled,
                "loaded": self.vehicle_model is not None,
                "model": settings.vehicle_model,
                "classes": list(self.vehicle_model.names.values()) if self.vehicle_model else []
            },
            "road_damage_detection": {
                "enabled": settings.road_damage_detection_enabled,
                "loaded": self.road_damage_model is not None,
                "model": settings.road_damage_model or "Not configured",
                "note": "Requires custom trained model - not yet implemented"
            }
        }
