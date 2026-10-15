'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Incident, IncidentSeverity } from '@/lib/types/dashboard';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

interface RecentIncidentsProps {
  incidents: Incident[];
}

function getSeverityVariant(severity: IncidentSeverity): 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<IncidentSeverity, 'success' | 'warning' | 'danger' | 'info'> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
  };
  return map[severity];
}

function formatIncidentType(type: string): string {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400">No incidents detected</p>
            <p className="text-sm text-gray-500 mt-2">
              Incidents will appear here as they are detected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Incidents</CardTitle>
        {incidents.some(i => i.is_demo) && (
          <Badge variant="info" className="text-xs">Demo Data</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-start gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className={`p-2 rounded-lg ${
                incident.severity === 'critical' ? 'bg-red-900/30' :
                incident.severity === 'high' ? 'bg-orange-900/30' :
                incident.severity === 'medium' ? 'bg-yellow-900/30' :
                'bg-blue-900/30'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  incident.severity === 'critical' ? 'text-red-400' :
                  incident.severity === 'high' ? 'text-orange-400' :
                  incident.severity === 'medium' ? 'text-yellow-400' :
                  'text-blue-400'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {formatIncidentType(incident.type)}
                    </p>
                    {incident.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {incident.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={getSeverityVariant(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{incident.location.address || 'Location N/A'}</span>
                  </div>
                  {incident.bus_number && (
                    <div className="flex items-center gap-1">
                      <span>Bus {incident.bus_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(incident.detected_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
