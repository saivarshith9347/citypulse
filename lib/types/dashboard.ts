// Dashboard types for CityPulse AI

export type IncidentStatus = 
  | 'detected'
  | 'verified'
  | 'rejected'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

export type IncidentType = 
  | 'pothole'
  | 'crack'
  | 'flooding'
  | 'debris'
  | 'congestion'
  | 'accident';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  severity: IncidentSeverity;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  bus_number?: string;
  confidence: number;
  description?: string;
  image_url?: string;
  detected_at: string;
  verified_at?: string;
  resolved_at?: string;
  is_demo?: boolean; // Flag for demo data
}

export interface Bus {
  id: string;
  number: string;
  route: string;
  status: 'online' | 'offline' | 'maintenance';
  location: {
    lat: number;
    lng: number;
  };
  last_ping?: string;
  detection_count?: number;
  is_demo?: boolean;
}

export interface DashboardStats {
  total_incidents: number;
  critical_incidents: number;
  active_buses: number;
  pending_verification: number;
  in_progress: number;
  resolved_today: number;
}
