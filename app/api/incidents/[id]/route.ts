import { NextRequest, NextResponse } from 'next/server';
import { getIncidentById, updateIncident } from '@/lib/db/incidents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await getIncidentById(id);

    return NextResponse.json({ incident });
  } catch (error: any) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const incident = await updateIncident({ id, ...body });

    return NextResponse.json({ incident });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update incident' },
      { status: 400 }
    );
  }
}
