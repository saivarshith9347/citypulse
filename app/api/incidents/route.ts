import { NextRequest, NextResponse } from 'next/server';
import { getIncidents, createIncident } from '@/lib/db/incidents';
import { createIncidentSchema } from '@/lib/schemas/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query: any = {};
    if (searchParams.get('event_type')) query.event_type = searchParams.get('event_type');
    if (searchParams.get('severity')) query.severity = searchParams.get('severity');
    if (searchParams.get('verification_status')) query.verification_status = searchParams.get('verification_status');
    if (searchParams.get('bus_id')) query.bus_id = searchParams.get('bus_id');
    if (searchParams.get('start_date')) query.start_date = searchParams.get('start_date');
    if (searchParams.get('end_date')) query.end_date = searchParams.get('end_date');
    if (searchParams.get('limit')) query.limit = parseInt(searchParams.get('limit')!);
    if (searchParams.get('offset')) query.offset = parseInt(searchParams.get('offset')!);

    const incidents = await getIncidents(query);

    return NextResponse.json({ incidents, count: incidents.length });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents', incidents: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createIncidentSchema.parse(body);
    
    const incident = await createIncident(validated);

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create incident' },
      { status: 400 }
    );
  }
}
