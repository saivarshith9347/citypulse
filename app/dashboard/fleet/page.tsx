'use client';

import { useState, useEffect } from 'react';
import { Bus as BusIcon, RefreshCw, MapPin, Activity, Clock, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Bus {
  id: string;
  bus_code: string;
  route_name: string;
  status: 'online' | 'offline' | 'maintenance';
  last_latitude: number | null;
  last_longitude: number | null;
  last_seen_at: string | null;
  detection_count?: number;
}

export default function FleetPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/buses');
      if (response.ok) {
        const data = await response.json();
        setBuses(data.buses || []);
      }
    } catch (error) {
      console.error('Error loading buses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBuses = buses.filter((bus) => {
    if (statusFilter === 'all') return true;
    return bus.status === statusFilter;
  });

  const stats = {
    total: buses.length,
    online: buses.filter((b) => b.status === 'online').length,
    offline: buses.filter((b) => b.status === 'offline').length,
    maintenance: buses.filter((b) => b.status === 'maintenance').length,
  };

  const statusColors: Record<string, string> = {
    online: 'bg-green-600',
    offline: 'bg-slate-600',
    maintenance: 'bg-amber-600',
  };

  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Fleet Monitoring</h1>
          <p className="text-slate-400 mt-1">
            Real-time status and location of bus fleet
          </p>
        </div>
        <button
          onClick={loadBuses}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Buses</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <BusIcon className="w-8 h-8 text-cyan-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Online</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.online}</p>
            </div>
            <Radio className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Offline</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.offline}</p>
            </div>
            <Activity className="w-8 h-8 text-slate-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Maintenance</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.maintenance}</p>
            </div>
            <Activity className="w-8 h-8 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Filter by status:</span>
        {['all', 'online', 'offline', 'maintenance'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              statusFilter === status
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bus Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : filteredBuses.length === 0 ? (
        <Card className="p-12 text-center">
          <BusIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No buses found</p>
          {statusFilter !== 'all' && (
            <p className="text-sm text-slate-500 mt-2">
              Try changing the status filter
            </p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuses.map((bus) => (
            <Card key={bus.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{bus.bus_code}</h3>
                    <p className="text-sm text-slate-400">{bus.route_name}</p>
                  </div>
                </div>
                <Badge className={statusColors[bus.status]}>
                  {bus.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                {bus.last_latitude && bus.last_longitude && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>
                      {bus.last_latitude.toFixed(4)}, {bus.last_longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Last seen {formatLastSeen(bus.last_seen_at)}</span>
                </div>

                {typeof bus.detection_count !== 'undefined' && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span>{bus.detection_count} detections</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
