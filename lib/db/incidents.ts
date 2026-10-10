import { createClient } from '@/lib/supabase/server';
import { 
  CreateIncident, 
  UpdateIncident, 
  IncidentQuery,
  createIncidentSchema,
  updateIncidentSchema,
  incidentQuerySchema
} from '@/lib/schemas/database';

/**
 * Get all incidents with optional filtering
 * Server-side only - uses RLS
 */
export async function getIncidents(query?: IncidentQuery) {
  const supabase = await createClient();
  
  // Validate query parameters with defaults
  const validatedQuery = query ? incidentQuerySchema.parse(query) : incidentQuerySchema.parse({});
  
  let queryBuilder = supabase
    .from('incidents')
    .select(`
      *,
      buses (
        bus_code,
        route_name
      )
    `)
    .order('detected_at', { ascending: false })
    .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1);

  // Apply filters
  if (validatedQuery.event_type) {
    queryBuilder = queryBuilder.eq('event_type', validatedQuery.event_type);
  }
  if (validatedQuery.severity) {
    queryBuilder = queryBuilder.eq('severity', validatedQuery.severity);
  }
  if (validatedQuery.verification_status) {
    queryBuilder = queryBuilder.eq('verification_status', validatedQuery.verification_status);
  }
  if (validatedQuery.bus_id) {
    queryBuilder = queryBuilder.eq('bus_id', validatedQuery.bus_id);
  }
  if (validatedQuery.start_date) {
    queryBuilder = queryBuilder.gte('detected_at', validatedQuery.start_date);
  }
  if (validatedQuery.end_date) {
    queryBuilder = queryBuilder.lte('detected_at', validatedQuery.end_date);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching incidents:', error);
    throw new Error(`Failed to fetch incidents: ${error.message}`);
  }

  return data;
}

/**
 * Get a single incident by ID with related data
 * Server-side only - uses RLS
 */
export async function getIncidentById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      buses (
        bus_code,
        route_name,
        last_latitude,
        last_longitude
      ),
      incident_observations (
        id,
        observed_at,
        confidence,
        bus_id,
        buses (
          bus_code
        )
      ),
      work_orders (
        id,
        status,
        priority,
        department_id,
        departments (
          name
        ),
        assigned_to,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching incident:', error);
    throw new Error(`Failed to fetch incident: ${error.message}`);
  }

  return data;
}

/**
 * Create a new incident
 * Server-side only - uses RLS
 */
export async function createIncident(incident: CreateIncident) {
  const supabase = await createClient();

  // Validate input
  const validatedData = createIncidentSchema.parse(incident);

  const { data, error } = await supabase
    .from('incidents')
    .insert({
      ...validatedData,
      verification_status: 'detected',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating incident:', error);
    throw new Error(`Failed to create incident: ${error.message}`);
  }

  return data;
}

/**
 * Update an incident (typically for verification/status changes)
 * Server-side only - uses RLS
 */
export async function updateIncident(update: UpdateIncident) {
  const supabase = await createClient();

  // Validate input
  const validatedData = updateIncidentSchema.parse(update);
  const { id, ...updates } = validatedData;

  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating incident:', error);
    throw new Error(`Failed to update incident: ${error.message}`);
  }

  return data;
}

/**
 * Get incident statistics for dashboard
 * Server-side only - uses RLS
 */
export async function getIncidentStats() {
  const supabase = await createClient();

  // Total incidents
  const { count: totalCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true });

  // Critical incidents
  const { count: criticalCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('severity', 'critical');

  // Pending verification
  const { count: pendingCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'detected');

  // In progress
  const { count: inProgressCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .in('verification_status', ['assigned', 'in_progress']);

  // Resolved today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: resolvedTodayCount } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'resolved')
    .gte('updated_at', today.toISOString());

  return {
    total_incidents: totalCount || 0,
    critical_incidents: criticalCount || 0,
    pending_verification: pendingCount || 0,
    in_progress: inProgressCount || 0,
    resolved_today: resolvedTodayCount || 0,
  };
}

/**
 * Get recent incidents (for dashboard)
 * Server-side only - uses RLS
 */
export async function getRecentIncidents(limit: number = 10) {
  return getIncidents({ limit, offset: 0 });
}
