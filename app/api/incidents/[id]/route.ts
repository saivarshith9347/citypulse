import { NextRequest, NextResponse } from 'next/server';
import { getIncidentById, updateIncident } from '@/lib/db/incidents';
import { updateIncidentSchema } from '@/lib/schemas/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await getIncidentById(id);

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
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
    
    const validated = updateIncidentSchema.parse({ id, ...body });
    const incident = await updateIncident(validated);

    return NextResponse.json({ incident });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update incident' },
      { status: 400 }
    );
  }
}
