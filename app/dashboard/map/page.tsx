'use client';

import { useState, useEffect } from 'react';
import { Filter, RefreshCw, AlertCircle, Bus as BusIcon, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});
import IncidentDetailModal from '@/components/incidents/IncidentDetailModal';
import WorkOrderModal from '@/components/incidents/WorkOrderModal';
import { Badge } from '@/components/ui/badge';
import type { Incident, IncidentQuery, CreateWorkOrder } from '@/lib/schemas/database';
import type { Bus } from '@/lib/schemas/database';
import type { Department } from '@/lib/db/departments';
import { IncidentTypeEnum, SeverityEnum, VerificationStatusEnum } from '@/lib/schemas/database';

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [filters, setFilters] = useState<Partial<IncidentQuery>>({
    limit: 1000, // Show all incidents on map
  });

  // Fetch data
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch incidents
      const incidentsResponse = await fetch('/api/incidents?' + new URLSearchParams({
        ...filters,
        limit: String(filters.limit || 1000),
      } as any));
      
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData.incidents || []);
      }

      // Fetch buses
      const busesResponse = await fetch('/api/buses');
      if (busesResponse.ok) {
        const busesData = await busesResponse.json();
        setBuses(busesData.buses || []);
      }

      // Fetch departments
      const deptsResponse = await fetch('/api/departments');
      if (deptsResponse.ok) {
        const deptsData = await deptsResponse.json();
        setDepartments(deptsData.departments || []);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (incidentId: string, status: string, description?: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_status: status,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update incident');
      }

      // Refresh data
      await loadData();
      alert('Incident updated successfully');
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  };

  const handleCreateWorkOrder = async (workOrder: CreateWorkOrder) => {
    try {
      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to create work order');
      }

      // Update incident status to 'assigned'
      await handleStatusUpdate(workOrder.incident_id, 'assigned');
      
      alert('Work order created successfully');
      setShowWorkOrderModal(false);
    } catch (error) {
      console.error('Error creating work order:', error);
      throw error;
    }
  };

  const handleOpenWorkOrderModal = (incidentId: string) => {
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      setSelectedIncident(incident);
      setShowDetailModal(false);
      setShowWorkOrderModal(true);
    }
  };

  const statusColors: Record<string, string> = {
    detected: 'bg-slate-600',
    verified: 'bg-blue-600',
    rejected: 'bg-red-600',
    assigned: 'bg-purple-600',
    in_progress: 'bg-amber-600',
    resolved: 'bg-green-600',
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">GIS Map</h1>
          <p className="text-slate-400 mt-1">
            Real-time incident and fleet visualization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Incident Type
              </label>
              <select
                value={filters.event_type || ''}
                onChange={(e) =>
                  setFilters({ ...filters, event_type: e.target.value as any || undefined })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Types</option>
                {IncidentTypeEnum.options.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Severity
              </label>
              <select
                value={filters.severity || ''}
                onChange={(e) =>
                  setFilters({ ...filters, severity: e.target.value as any || undefined })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Severities</option>
                {SeverityEnum.options.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.verification_status || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    verification_status: e.target.value as any || undefined,
                  })
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Statuses</option>
                {VerificationStatusEnum.options.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setFilters({ limit: 1000 })}
              className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Map and Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100%-8rem)]">
        {/* Map */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : (
            <MapContainer
              incidents={incidents}
              buses={buses}
              onIncidentClick={handleIncidentClick}
            />
          )}
        </div>

        {/* Side Panel - Incident List */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Incidents</h3>
            <Badge className="bg-cyan-600">{incidents.length}</Badge>
          </div>

          {incidents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No incidents found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {incidents.slice(0, 50).map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => handleIncidentClick(incident)}
                  className="w-full text-left p-3 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors border border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-white capitalize">
                      {incident.event_type.replace('_', ' ')}
                    </span>
                    <Badge className={severityColors[incident.severity]}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </span>
                    </div>
                    <Badge
                      className={statusColors[incident.verification_status || 'detected']}
                    >
                      {(incident.verification_status || 'detected').replace('_', ' ')}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setShowDetailModal(false)}
          onStatusUpdate={handleStatusUpdate}
          onCreateWorkOrder={handleOpenWorkOrderModal}
        />
      )}

      {showWorkOrderModal && (
        <WorkOrderModal
          incident={selectedIncident}
          departments={departments}
          onClose={() => setShowWorkOrderModal(false)}
          onSubmit={handleCreateWorkOrder}
        />
      )}
    </div>
  );
}
