'use client';

import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident } from '@/lib/schemas/database';
import type { Bus } from '@/lib/schemas/database';
import { MapPin, Bus as BusIcon, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  incidents?: Incident[];
  buses?: Bus[];
  center?: [number, number];
  zoom?: number;
  onIncidentClick?: (incident: Incident) => void;
  onBusClick?: (bus: Bus) => void;
}

// Custom marker icons
const createCustomIcon = (color: string, IconComponent: React.ComponentType<any>) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          ${IconComponent === MapPin ? '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' : ''}
          ${IconComponent === BusIcon ? '<path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4a2 2 0 0 0-2 2v10h2a2 2 0 1 0 4 0h4a2 2 0 1 0 4 0zm-7 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>' : ''}
        </svg>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const getIncidentColor = (incident: Incident) => {
  switch (incident.severity) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#f97316'; // orange-500
    case 'medium':
      return '#f59e0b'; // amber-500
    case 'low':
      return '#22c55e'; // green-500
    default:
      return '#64748b'; // slate-500
  }
};

const getBusColor = (bus: Bus) => {
  switch (bus.status) {
    case 'online':
      return '#06b6d4'; // cyan-500
    case 'offline':
      return '#64748b'; // slate-500
    case 'maintenance':
      return '#f59e0b'; // amber-500
    default:
      return '#64748b';
  }
};

const getSeverityLabel = (severity: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
  };
  return <Badge className={colors[severity] || 'bg-slate-500'}>{severity}</Badge>;
};

const getStatusLabel = (status: string) => {
  const colors: Record<string, string> = {
    detected: 'bg-slate-600',
    verified: 'bg-blue-600',
    rejected: 'bg-red-600',
    assigned: 'bg-purple-600',
    in_progress: 'bg-amber-600',
    resolved: 'bg-green-600',
  };
  return <Badge className={colors[status] || 'bg-slate-500'}>{status.replace('_', ' ')}</Badge>;
};

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function InteractiveMap({
  incidents = [],
  buses = [],
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  onIncidentClick,
  onBusClick,
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} zoom={zoom} />

      {/* Incident Markers */}
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={createCustomIcon(getIncidentColor(incident), MapPin)}
          eventHandlers={{
            click: () => onIncidentClick?.(incident),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm capitalize">
                  {incident.event_type.replace('_', ' ')}
                </h3>
                {getSeverityLabel(incident.severity)}
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p>
                  <span className="font-medium">Status:</span> {getStatusLabel(incident.verification_status || 'detected')}
                </p>
                <p>
                  <span className="font-medium">Confidence:</span> {incident.confidence}%
                </p>
                <p>
                  <span className="font-medium">Location:</span> {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                </p>
                {incident.detected_at && (
                  <p>
                    <span className="font-medium">Detected:</span>{' '}
                    {new Date(incident.detected_at).toLocaleString()}
                  </p>
                )}
                {incident.description && (
                  <p className="mt-2">
                    <span className="font-medium">Description:</span> {incident.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onIncidentClick?.(incident)}
                className="mt-3 w-full py-1 px-2 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Bus Markers */}
      {buses.map((bus) => {
        if (!bus.last_latitude || !bus.last_longitude) return null;
        return (
          <Marker
            key={bus.id}
            position={[bus.last_latitude, bus.last_longitude]}
            icon={createCustomIcon(getBusColor(bus), BusIcon)}
            eventHandlers={{
              click: () => onBusClick?.(bus),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm">{bus.bus_code}</h3>
                  <Badge className={bus.status === 'online' ? 'bg-cyan-600' : 'bg-slate-600'}>
                    {bus.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>
                    <span className="font-medium">Route:</span> {bus.route_name}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {bus.last_latitude.toFixed(6)},{' '}
                    {bus.last_longitude.toFixed(6)}
                  </p>
                  {bus.last_seen_at && (
                    <p>
                      <span className="font-medium">Last Seen:</span>{' '}
                      {new Date(bus.last_seen_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onBusClick?.(bus)}
                  className="mt-3 w-full py-1 px-2 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </LeafletMap>
  );
}
