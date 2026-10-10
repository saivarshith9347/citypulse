import { NextResponse } from 'next/server';
import { getDepartments } from '@/lib/db/departments';

export async function GET() {
  try {
    const departments = await getDepartments();

    return NextResponse.json({ departments, count: departments.length });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments', departments: [] },
      { status: 500 }
    );
  }
}
