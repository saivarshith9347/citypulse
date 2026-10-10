import { NextRequest, NextResponse } from 'next/server';
import { getBuses } from '@/lib/db/buses';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query: any = {};
    if (searchParams.get('status')) query.status = searchParams.get('status');
    if (searchParams.get('route_name')) query.route_name = searchParams.get('route_name');
    if (searchParams.get('limit')) query.limit = parseInt(searchParams.get('limit')!);
    if (searchParams.get('offset')) query.offset = parseInt(searchParams.get('offset')!);

    const buses = await getBuses(query);

    return NextResponse.json({ buses, count: buses.length });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buses', buses: [] },
      { status: 500 }
    );
  }
}
