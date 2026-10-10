import { Incident, Bus, DashboardStats } from '@/lib/types/dashboard';

// Sample incidents for demo
export const sampleIncidents: Incident[] = [
  {
    id: '1',
    type: 'pothole',
    status: 'detected',
    severity: 'high',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Connaught Place, New Delhi',
    },
    bus_number: 'DL-1234',
    confidence: 89,
    description: 'Large pothole detected on main road',
    detected_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    is_demo: true,
  },
  {
    id: '2',
    type: 'crack',
    status: 'verified',
    severity: 'medium',
    location: {
      lat: 28.7041,
      lng: 77.1025,
      address: 'GTB Nagar, Delhi',
    },
    bus_number: 'DL-5678',
    confidence: 76,
    description: 'Road surface crack observed',
    detected_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    verified_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_demo: true,
  },
  {
    id: '3',
    type: 'congestion',
    status: 'in_progress',
    severity: 'critical',
    location: {
      lat: 28.5355,
      lng: 77.3910,
      address: 'Noida Sector 18',
    },
    bus_number: 'UP-9012',
    confidence: 92,
    description: 'Heavy traffic congestion detected',
    detected_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    verified_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
    is_demo: true,
  },
  {
    id: '4',
    type: 'debris',
    status: 'resolved',
    severity: 'low',
    location: {
      lat: 28.6692,
      lng: 77.4538,
      address: 'Ghaziabad',
    },
    bus_number: 'UP-3456',
    confidence: 84,
    description: 'Debris on roadside',
    detected_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    verified_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_demo: true,
  },
  {
    id: '5',
    type: 'pothole',
    status: 'detected',
    severity: 'critical',
    location: {
      lat: 28.4595,
      lng: 77.0266,
      address: 'Gurugram, Haryana',
    },
    bus_number: 'HR-7890',
    confidence: 95,
    description: 'Deep pothole causing traffic issues',
    detected_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    is_demo: true,
  },
];

// Sample buses for demo
export const sampleBuses: Bus[] = [
  {
    id: '1',
    number: 'DL-1234',
    route: 'Route 52',
    status: 'online',
    location: { lat: 28.6139, lng: 77.2090 },
    last_ping: new Date().toISOString(),
    detection_count: 12,
    is_demo: true,
  },
  {
    id: '2',
    number: 'DL-5678',
    route: 'Route 34',
    status: 'online',
    location: { lat: 28.7041, lng: 77.1025 },
    last_ping: new Date().toISOString(),
    detection_count: 8,
    is_demo: true,
  },
  {
    id: '3',
    number: 'UP-9012',
    route: 'Route 18',
    status: 'online',
    location: { lat: 28.5355, lng: 77.3910 },
    last_ping: new Date().toISOString(),
    detection_count: 15,
    is_demo: true,
  },
  {
    id: '4',
    number: 'UP-3456',
    route: 'Route 76',
    status: 'offline',
    location: { lat: 28.6692, lng: 77.4538 },
    last_ping: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    detection_count: 5,
    is_demo: true,
  },
  {
    id: '5',
    number: 'HR-7890',
    route: 'Route 91',
    status: 'maintenance',
    location: { lat: 28.4595, lng: 77.0266 },
    last_ping: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    detection_count: 3,
    is_demo: true,
  },
  {
    id: '6',
    number: 'DL-2468',
    route: 'Route 45',
    status: 'online',
    location: { lat: 28.6500, lng: 77.2167 },
    last_ping: new Date().toISOString(),
    detection_count: 7,
    is_demo: true,
  },
];

// Calculate dashboard stats from sample data
export function getDashboardStats(incidents: Incident[]): DashboardStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    total_incidents: incidents.length,
    critical_incidents: incidents.filter(i => i.severity === 'critical').length,
    active_buses: sampleBuses.filter(b => b.status === 'online').length,
    pending_verification: incidents.filter(i => i.status === 'detected').length,
    in_progress: incidents.filter(i => i.status === 'in_progress' || i.status === 'assigned').length,
    resolved_today: incidents.filter(i => 
      i.status === 'resolved' && 
      i.resolved_at && 
      new Date(i.resolved_at) >= todayStart
    ).length,
  };
}
