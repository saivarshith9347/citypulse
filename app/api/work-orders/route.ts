import { NextRequest, NextResponse } from 'next/server';
import { getWorkOrders, createWorkOrder } from '@/lib/db/work-orders';
import { createWorkOrderSchema } from '@/lib/schemas/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query: any = {};
    if (searchParams.get('incident_id')) query.incident_id = searchParams.get('incident_id');
    if (searchParams.get('department_id')) query.department_id = searchParams.get('department_id');
    if (searchParams.get('status')) query.status = searchParams.get('status');
    if (searchParams.get('priority')) query.priority = searchParams.get('priority');
    if (searchParams.get('limit')) query.limit = parseInt(searchParams.get('limit')!);
    if (searchParams.get('offset')) query.offset = parseInt(searchParams.get('offset')!);

    const workOrders = await getWorkOrders(query);

    return NextResponse.json({ workOrders, count: workOrders.length });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work orders', workOrders: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createWorkOrderSchema.parse(body);
    
    const workOrder = await createWorkOrder(validated);

    return NextResponse.json({ workOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating work order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create work order' },
      { status: 400 }
    );
  }
}
