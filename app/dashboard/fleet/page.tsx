import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function FleetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Fleet</h1>
        <p className="text-gray-400 mt-1">Monitor bus fleet in real-time</p>
      </div>

      <ComingSoon
        title="Live Fleet Monitoring"
        description="This module will display real-time bus locations on a map with status indicators and detection activity."
      />
    </div>
  );
}
