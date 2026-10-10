import { createClient } from '@/lib/supabase/server';

export interface Department {
  id: string;
  name: string;
  contact_email: string;
  created_at?: string;
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single department by ID
 */
export async function getDepartmentById(id: string): Promise<Department | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching department:', error);
    return null;
  }

  return data;
}
