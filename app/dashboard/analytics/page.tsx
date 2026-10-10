import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">analytics module</p>
      </div>
      <ComingSoon
        title="Analytics Module"
        description="Traffic patterns, incident trends, and performance metrics with interactive charts."
      />
    </div>
  );
}
