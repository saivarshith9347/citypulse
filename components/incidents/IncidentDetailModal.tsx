'use client';

import { useState } from 'react';
import { X, AlertTriangle, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Incident } from '@/lib/schemas/database';
import { VerificationStatusEnum } from '@/lib/schemas/database';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onStatusUpdate: (incidentId: string, status: string, description?: string) => Promise<void>;
  onCreateWorkOrder: (incidentId: string) => void;
}

const statusOptions = VerificationStatusEnum.options;

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

export default function IncidentDetailModal({
  incident,
  onClose,
  onStatusUpdate,
  onCreateWorkOrder,
}: IncidentDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(incident?.verification_status || 'detected');
  const [description, setDescription] = useState(incident?.description || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!incident) return null;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(incident.id!, selectedStatus, description);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateWorkOrder = () => {
    onCreateWorkOrder(incident.id!);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-cyan-500" />
              <h2 className="text-xl font-semibold text-white capitalize">
                {incident.event_type.replace('_', ' ')} Incident
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={severityColors[incident.severity]}>
                {incident.severity}
              </Badge>
              <Badge className={statusColors[incident.verification_status || 'detected']}>
                {(incident.verification_status || 'detected').replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Incident Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400">Incident ID</label>
              <p className="text-white font-mono text-sm mt-1">{incident.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">Confidence Score</label>
              <p className="text-white mt-1">{incident.confidence}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                <MapPin className="inline w-4 h-4 mr-1" />
                Location
              </label>
              <p className="text-white text-sm mt-1">
                {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400">
                <Clock className="inline w-4 h-4 mr-1" />
                Detected At
              </label>
              <p className="text-white text-sm mt-1">
                {incident.detected_at
                  ? new Date(incident.detected_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Evidence Image */}
          {incident.evidence_path && (
            <div>
              <label className="text-sm font-medium text-slate-400">Evidence</label>
              <div className="mt-2 rounded-lg overflow-hidden bg-slate-800">
                <img
                  src={incident.evidence_path}
                  alt="Incident evidence"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-slate-400" htmlFor="description">
              Description / Notes
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={4}
              placeholder="Add notes or description..."
            />
          </div>

          {/* Status Update */}
          <div>
            <label className="text-sm font-medium text-slate-400" htmlFor="status">
              Update Status
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'detected' | 'verified' | 'rejected' | 'assigned' | 'in_progress' | 'resolved')}
              className="w-full mt-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
            
            {selectedStatus === 'verified' && (
              <button
                onClick={handleCreateWorkOrder}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Create Work Order
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
