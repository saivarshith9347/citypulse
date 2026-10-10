"""Database operations using Supabase."""

import logging
from typing import List, Optional
from supabase import create_client, Client
from datetime import datetime

from app.models import DetectionEvent
from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseClient:
    """Supabase database client for persisting events."""
    
    def __init__(self):
        """Initialize Supabase client."""
        try:
            self.client: Client = create_client(
                settings.supabase_url,
                settings.supabase_service_key
            )
            logger.info("Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if database connection is available."""
        if not self.client:
            return False
        
        try:
            # Test connection by querying departments table
            response = self.client.table('departments').select('id').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return False
    
    def create_incident(self, event: DetectionEvent) -> Optional[str]:
        """
        Create incident in database from detection event.
        
        Args:
            event: Detection event to persist
            
        Returns:
            Incident ID if successful, None otherwise
        """
        if not self.client:
            logger.error("Supabase client not initialized")
            return None
        
        try:
            # Prepare incident data
            incident_data = {
                "event_type": event.event_type,
                "severity": event.severity.value,
                "confidence": event.confidence * 100,  # Convert to percentage
                "latitude": event.latitude,
                "longitude": event.longitude,
                "detected_at": event.timestamp.isoformat(),
                "bus_id": event.bus_id,
                "evidence_path": event.evidence_path,
                "description": self._build_description(event),
                "verification_status": "detected"
            }
            
            # Insert into incidents table
            response = self.client.table('incidents').insert(incident_data).execute()
            
            if response.data and len(response.data) > 0:
                incident_id = response.data[0].get('id')
                logger.info(f"Created incident {incident_id} for event {event.event_id}")
                return incident_id
            else:
                logger.error("Failed to create incident: no data returned")
                return None
        
        except Exception as e:
            logger.error(f"Failed to create incident: {e}")
            return None
    
    def batch_create_incidents(self, events: List[DetectionEvent]) -> List[str]:
        """
        Create multiple incidents in batch.
        
        Args:
            events: List of detection events
            
        Returns:
            List of created incident IDs
        """
        if not self.client:
            logger.error("Supabase client not initialized")
            return []
        
        incident_ids = []
        
        try:
            # Prepare batch data
            incidents_data = []
            for event in events:
                incidents_data.append({
                    "event_type": event.event_type,
                    "severity": event.severity.value,
                    "confidence": event.confidence * 100,
                    "latitude": event.latitude,
                    "longitude": event.longitude,
                    "detected_at": event.timestamp.isoformat(),
                    "bus_id": event.bus_id,
                    "evidence_path": event.evidence_path,
                    "description": self._build_description(event),
                    "verification_status": "detected"
                })
            
            # Batch insert
            response = self.client.table('incidents').insert(incidents_data).execute()
            
            if response.data:
                incident_ids = [record.get('id') for record in response.data]
                logger.info(f"Created {len(incident_ids)} incidents in batch")
            
        except Exception as e:
            logger.error(f"Batch insert failed: {e}")
        
        return incident_ids
    
    def _build_description(self, event: DetectionEvent) -> str:
        """Build human-readable description from event."""
        description = event.description
        
        if event.is_simulated:
            description += " [SIMULATED GPS]"
        
        if event.metadata:
            if "detection_count" in event.metadata:
                description += f" ({event.metadata['detection_count']} detections)"
        
        return description
    
    def get_bus_id(self, bus_code: str) -> Optional[str]:
        """Get bus UUID from bus code."""
        if not self.client:
            return None
        
        try:
            response = self.client.table('buses') \
                .select('id') \
                .eq('bus_code', bus_code) \
                .limit(1) \
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0].get('id')
        
        except Exception as e:
            logger.error(f"Failed to get bus ID: {e}")
        
        return None


# Global database client instance
db_client = DatabaseClient()
