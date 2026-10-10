'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus as BusType } from '@/lib/types/dashboard';
import { Bus, Wifi, WifiOff, Wrench } from 'lucide-react';

interface FleetStatusProps {
  buses: BusType[];
}

export function FleetStatus({ buses }: FleetStatusProps) {
  const onlineBuses = buses.filter(b => b.status === 'online');
  const offlineBuses = buses.filter(b => b.status === 'offline');
  const maintenanceBuses = buses.filter(b => b.status === 'maintenance');

  const isDemoData = buses.some(b => b.is_demo);

  if (buses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bus className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400">No buses registered</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fleet Status</CardTitle>
        {isDemoData && <Badge variant="info" className="text-xs">Demo Data</Badge>}
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-2xl font-bold text-green-400">{onlineBuses.length}</p>
            <p className="text-xs text-gray-400 mt-1">Online</p>
          </div>
          <div className="text-center p-4 bg-gray-900/20 border border-gray-700/30 rounded-lg">
            <p className="text-2xl font-bold text-gray-400">{offlineBuses.length}</p>
            <p className="text-xs text-gray-400 mt-1">Offline</p>
          </div>
          <div className="text-center p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
            <p className="text-2xl font-bold text-orange-400">{maintenanceBuses.length}</p>
            <p className="text-xs text-gray-400 mt-1">Maintenance</p>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {buses.slice(0, 10).map((bus) => (
            <div
              key={bus.id}
              className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  bus.status === 'online' ? 'bg-green-900/30' :
                  bus.status === 'offline' ? 'bg-gray-900/30' :
                  'bg-orange-900/30'
                }`}>
                  {bus.status === 'online' ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : bus.status === 'offline' ? (
                    <WifiOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Wrench className="w-4 h-4 text-orange-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    Bus {bus.number}
                  </p>
                  <p className="text-xs text-gray-400">Route {bus.route}</p>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant={
                    bus.status === 'online' ? 'success' :
                    bus.status === 'offline' ? 'default' :
                    'warning'
                  }
                >
                  {bus.status}
                </Badge>
                {bus.detection_count !== undefined && (
                  <p className="text-xs text-gray-400 mt-1">
                    {bus.detection_count} detections
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {buses.length > 10 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Showing 10 of {buses.length} buses
          </p>
        )}
      </CardContent>
    </Card>
  );
}
