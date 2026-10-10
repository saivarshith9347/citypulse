import { createClient } from '@/lib/supabase/server';
import { BusQuery, busQuerySchema } from '@/lib/schemas/database';

/**
 * Get all buses with optional filtering
 * Server-side only - uses RLS
 */
export async function getBuses(query?: BusQuery) {
  const supabase = await createClient();
  
  // Validate query parameters with defaults
  const validatedQuery = query ? busQuerySchema.parse(query) : busQuerySchema.parse({});
  
  let queryBuilder = supabase
    .from('buses')
    .select('*')
    .order('bus_code', { ascending: true })
    .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1);

  // Apply filters
  if (validatedQuery.status) {
    queryBuilder = queryBuilder.eq('status', validatedQuery.status);
  }
  if (validatedQuery.route_name) {
    queryBuilder = queryBuilder.ilike('route_name', `%${validatedQuery.route_name}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching buses:', error);
    throw new Error(`Failed to fetch buses: ${error.message}`);
  }

  return data;
}

/**
 * Get a single bus by ID
 * Server-side only - uses RLS
 */
export async function getBusById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('buses')
    .select(`
      *,
      incidents (
        id,
        event_type,
        severity,
        detected_at,
        verification_status
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching bus:', error);
    throw new Error(`Failed to fetch bus: ${error.message}`);
  }

  return data;
}

/**
 * Get bus statistics for dashboard
 * Server-side only - uses RLS
 */
export async function getBusStats() {
  const supabase = await createClient();

  // Total buses
  const { count: totalCount } = await supabase
    .from('buses')
    .select('*', { count: 'exact', head: true });

  // Online buses
  const { count: onlineCount } = await supabase
    .from('buses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'online');

  // Offline buses
  const { count: offlineCount } = await supabase
    .from('buses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'offline');

  // Maintenance buses
  const { count: maintenanceCount } = await supabase
    .from('buses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'maintenance');

  return {
    total_buses: totalCount || 0,
    active_buses: onlineCount || 0,
    offline_buses: offlineCount || 0,
    maintenance_buses: maintenanceCount || 0,
  };
}

/**
 * Get buses with their detection counts
 * Server-side only - uses RLS
 */
export async function getBusesWithDetectionCounts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('buses')
    .select(`
      *,
      incidents (count)
    `)
    .order('bus_code', { ascending: true });

  if (error) {
    console.error('Error fetching buses with detection counts:', error);
    throw new Error(`Failed to fetch buses: ${error.message}`);
  }

  // Transform the data to include detection_count
  return data?.map(bus => ({
    ...bus,
    detection_count: bus.incidents?.[0]?.count || 0,
  })) || [];
}
