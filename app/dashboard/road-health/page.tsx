import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function RoadHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Road Health</h1>
        <p className="text-gray-400 mt-1">road health module</p>
      </div>
      <ComingSoon
        title="Road Health Module"
        description="Comprehensive road condition analysis and damage assessment across the city."
      />
    </div>
  );
}
