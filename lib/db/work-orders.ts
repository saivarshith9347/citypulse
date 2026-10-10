import { createClient } from '@/lib/supabase/server';
import {
  WorkOrder,
  CreateWorkOrder,
  UpdateWorkOrder,
  WorkOrderQuery,
  createWorkOrderSchema,
  updateWorkOrderSchema,
  workOrderQuerySchema,
} from '@/lib/schemas/database';

/**
 * Fetch work orders with optional filtering
 */
export async function getWorkOrders(query?: Partial<WorkOrderQuery>): Promise<WorkOrder[]> {
  const supabase = await createClient();
  const params = workOrderQuerySchema.parse(query || {});

  let queryBuilder = supabase
    .from('work_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1);

  if (params.status) {
    queryBuilder = queryBuilder.eq('status', params.status);
  }
  if (params.priority) {
    queryBuilder = queryBuilder.eq('priority', params.priority);
  }
  if (params.department_id) {
    queryBuilder = queryBuilder.eq('department_id', params.department_id);
  }
  if (params.incident_id) {
    queryBuilder = queryBuilder.eq('incident_id', params.incident_id);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single work order by ID
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching work order:', error);
    return null;
  }

  return data;
}

/**
 * Get work orders for a specific incident
 */
export async function getWorkOrdersByIncident(incidentId: string): Promise<WorkOrder[]> {
  return getWorkOrders({ incident_id: incidentId });
}

/**
 * Create a new work order
 */
export async function createWorkOrder(workOrder: CreateWorkOrder): Promise<WorkOrder> {
  const supabase = await createClient();
  const validated = createWorkOrderSchema.parse(workOrder);

  const { data, error } = await supabase
    .from('work_orders')
    .insert(validated)
    .select()
    .single();

  if (error) {
    console.error('Error creating work order:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing work order
 */
export async function updateWorkOrder(workOrder: UpdateWorkOrder): Promise<WorkOrder> {
  const supabase = await createClient();
  const validated = updateWorkOrderSchema.parse(workOrder);
  const { id, ...updates } = validated;

  const { data, error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating work order:', error);
    throw error;
  }

  return data;
}

/**
 * Get work order statistics
 */
export async function getWorkOrderStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('work_orders')
    .select('status, priority');

  if (error) {
    console.error('Error fetching work order stats:', error);
    return {
      total: 0,
      byStatus: {},
      byPriority: {},
    };
  }

  const byStatus = data.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byPriority = data.reduce((acc, order) => {
    acc[order.priority] = (acc[order.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: data.length,
    byStatus,
    byPriority,
  };
}
