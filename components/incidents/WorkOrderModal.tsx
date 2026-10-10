'use client';

import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Incident, CreateWorkOrder } from '@/lib/schemas/database';
import type { Department } from '@/lib/db/departments';
import { PriorityEnum } from '@/lib/schemas/database';

interface WorkOrderModalProps {
  incident: Incident | null;
  departments: Department[];
  onClose: () => void;
  onSubmit: (workOrder: CreateWorkOrder) => Promise<void>;
}

const priorityOptions = PriorityEnum.options;

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export default function WorkOrderModal({
  incident,
  departments,
  onClose,
  onSubmit,
}: WorkOrderModalProps) {
  const [departmentId, setDepartmentId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Auto-select department based on incident type
    if (incident && departments.length > 0) {
      let suggestedDept = departments[0].id;
      
      switch (incident.event_type) {
        case 'pothole':
        case 'crack':
          suggestedDept = departments.find(d => d.name.toLowerCase().includes('road'))?.id || suggestedDept;
          break;
        case 'flooding':
          suggestedDept = departments.find(d => d.name.toLowerCase().includes('public'))?.id || suggestedDept;
          break;
        case 'debris':
          suggestedDept = departments.find(d => d.name.toLowerCase().includes('public'))?.id || suggestedDept;
          break;
        case 'congestion':
        case 'accident':
          suggestedDept = departments.find(d => d.name.toLowerCase().includes('traffic'))?.id || suggestedDept;
          break;
      }
      
      setDepartmentId(suggestedDept);
    }

    // Auto-set priority based on severity
    if (incident) {
      switch (incident.severity) {
        case 'critical':
          setPriority('urgent');
          break;
        case 'high':
          setPriority('high');
          break;
        case 'medium':
          setPriority('medium');
          break;
        case 'low':
          setPriority('low');
          break;
      }
    }
  }, [incident, departments]);

  if (!incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentId) {
      alert('Please select a department');
      return;
    }

    setIsSubmitting(true);
    try {
      const workOrder: CreateWorkOrder = {
        incident_id: incident.id!,
        department_id: departmentId,
        assigned_to: assignedTo || null,
        status: 'pending',
        priority,
      };

      await onSubmit(workOrder);
      onClose();
    } catch (error) {
      console.error('Failed to create work order:', error);
      alert('Failed to create work order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">Create Work Order</h2>
              <p className="text-sm text-slate-400 mt-1">
                Assign incident to department for resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Incident Summary */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-slate-300">Incident Details</span>
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p>
                <span className="font-medium">Type:</span>{' '}
                <span className="capitalize">{incident.event_type.replace('_', ' ')}</span>
              </p>
              <p>
                <span className="font-medium">Severity:</span>{' '}
                <Badge className={priorityColors[incident.severity]}>
                  {incident.severity}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Location:</span>{' '}
                {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-slate-300 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-300 mb-2">
              Assign To (Optional)
            </label>
            <input
              id="assignedTo"
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Enter name or leave blank"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={200}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !departmentId}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Work Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
