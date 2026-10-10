'use client';

import { useState, useEffect } from 'react';
import { Filter, RefreshCw, AlertTriangle, FileText, MapPin, Clock, Search } from 'lucide-react';
import IncidentDetailModal from '@/components/incidents/IncidentDetailModal';
import WorkOrderModal from '@/components/incidents/WorkOrderModal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Incident, IncidentQuery, CreateWorkOrder } from '@/lib/schemas/database';
import type { Department } from '@/lib/db/departments';
import { IncidentTypeEnum, SeverityEnum, VerificationStatusEnum } from '@/lib/schemas/database';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<IncidentQuery>>({
    limit: 50,
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
        limit: String(filters.limit || 50),
      } as any));
      
      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData.incidents || []);
      }

      // Fetch departments
      const deptsResponse = await fetch('/api/departments');
      if (deptsResponse.ok) {
        const deptsData = await deptsResponse.json();
        setDepartments(deptsData.departments || []);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
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

  // Filter incidents by search query
  const filteredIncidents = incidents.filter((incident) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      incident.event_type.toLowerCase().includes(query) ||
      incident.id?.toLowerCase().includes(query) ||
      incident.description?.toLowerCase().includes(query)
    );
  });

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

  // Calculate statistics
  const stats = {
    total: incidents.length,
    byStatus: incidents.reduce((acc, inc) => {
      const status = inc.verification_status || 'detected';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: incidents.reduce((acc, inc) => {
      acc[inc.severity] = (acc[inc.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Management</h1>
          <p className="text-slate-400 mt-1">
            Review, verify and manage detected incidents
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Incidents</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-cyan-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending Review</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.byStatus.detected || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Verified</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.byStatus.verified || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Resolved</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.byStatus.resolved || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
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
              onClick={() => setFilters({ limit: 50 })}
              className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search incidents by type, ID, or description..."
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Incidents Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Detected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No incidents found
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white capitalize">
                        {incident.event_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={severityColors[incident.severity]}>
                        {incident.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={statusColors[incident.verification_status || 'detected']}
                      >
                        {(incident.verification_status || 'detected').replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">{incident.confidence}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {incident.detected_at
                          ? new Date(incident.detected_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncidentClick(incident);
                        }}
                        className="text-cyan-500 hover:text-cyan-400 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
