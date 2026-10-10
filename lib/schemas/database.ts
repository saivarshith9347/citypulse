import { z } from 'zod';

// =====================================================
// Enums matching database constraints
// =====================================================

export const BusStatusEnum = z.enum(['online', 'offline', 'maintenance']);
export const IncidentTypeEnum = z.enum(['pothole', 'crack', 'flooding', 'debris', 'congestion', 'accident']);
export const SeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const VerificationStatusEnum = z.enum(['detected', 'verified', 'rejected', 'assigned', 'in_progress', 'resolved']);
export const WorkOrderStatusEnum = z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']);
export const PriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

// =====================================================
// Bus Schemas
// =====================================================

export const busSchema = z.object({
  id: z.string().uuid().optional(),
  bus_code: z.string().min(3).max(20),
  route_name: z.string().min(1).max(100),
  status: BusStatusEnum,
  last_latitude: z.number().min(-90).max(90).nullable().optional(),
  last_longitude: z.number().min(-180).max(180).nullable().optional(),
  last_seen_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createBusSchema = busSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

export const updateBusSchema = busSchema.partial().required({ id: true });

// =====================================================
// Incident Schemas
// =====================================================

export const incidentSchema = z.object({
  id: z.string().uuid().optional(),
  event_type: IncidentTypeEnum,
  severity: SeverityEnum,
  confidence: z.number().min(0).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  detected_at: z.string().datetime().optional(),
  bus_id: z.string().uuid().nullable().optional(),
  evidence_path: z.string().nullable().optional(),
  verification_status: VerificationStatusEnum.optional(),
  description: z.string().max(500).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createIncidentSchema = incidentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  verification_status: true,
});

export const updateIncidentSchema = z.object({
  id: z.string().uuid(),
  verification_status: VerificationStatusEnum.optional(),
  description: z.string().max(500).nullable().optional(),
  evidence_path: z.string().nullable().optional(),
});

// =====================================================
// Work Order Schemas
// =====================================================

export const workOrderSchema = z.object({
  id: z.string().uuid().optional(),
  incident_id: z.string().uuid(),
  department_id: z.string().uuid(),
  assigned_to: z.string().max(200).nullable().optional(),
  status: WorkOrderStatusEnum,
  priority: PriorityEnum,
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  resolution_notes: z.string().max(1000).nullable().optional(),
});

export const createWorkOrderSchema = workOrderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  completed_at: true,
});

export const updateWorkOrderSchema = z.object({
  id: z.string().uuid(),
  status: WorkOrderStatusEnum.optional(),
  assigned_to: z.string().max(200).nullable().optional(),
  resolution_notes: z.string().max(1000).nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
});

// =====================================================
// Incident Observation Schemas
// =====================================================

export const observationSchema = z.object({
  id: z.string().uuid().optional(),
  incident_id: z.string().uuid(),
  bus_id: z.string().uuid().nullable().optional(),
  observed_at: z.string().datetime().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  confidence: z.number().min(0).max(100),
  evidence_path: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export const createObservationSchema = observationSchema.omit({
  id: true,
  created_at: true,
});

// =====================================================
// Query Schemas (for filtering/pagination)
// =====================================================

export const incidentQuerySchema = z.object({
  event_type: IncidentTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  verification_status: VerificationStatusEnum.optional(),
  bus_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(1000).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const busQuerySchema = z.object({
  status: BusStatusEnum.optional(),
  route_name: z.string().optional(),
  limit: z.number().int().min(1).max(1000).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const workOrderQuerySchema = z.object({
  status: WorkOrderStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  department_id: z.string().uuid().optional(),
  incident_id: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(1000).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

// =====================================================
// Type exports
// =====================================================

export type Bus = z.infer<typeof busSchema>;
export type CreateBus = z.infer<typeof createBusSchema>;
export type UpdateBus = z.infer<typeof updateBusSchema>;

export type Incident = z.infer<typeof incidentSchema>;
export type CreateIncident = z.infer<typeof createIncidentSchema>;
export type UpdateIncident = z.infer<typeof updateIncidentSchema>;

export type WorkOrder = z.infer<typeof workOrderSchema>;
export type CreateWorkOrder = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrder = z.infer<typeof updateWorkOrderSchema>;

export type Observation = z.infer<typeof observationSchema>;
export type CreateObservation = z.infer<typeof createObservationSchema>;

export type IncidentQuery = z.infer<typeof incidentQuerySchema>;
export type BusQuery = z.infer<typeof busQuerySchema>;
export type WorkOrderQuery = z.infer<typeof workOrderQuerySchema>;
