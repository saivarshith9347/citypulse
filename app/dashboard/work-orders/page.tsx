import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Work Orders</h1>
        <p className="text-gray-400 mt-1">work orders module</p>
      </div>
      <ComingSoon
        title="Work Orders Module"
        description="Create, assign, and track maintenance work orders for road repairs."
      />
    </div>
  );
}
