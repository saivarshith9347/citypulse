import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">reports module</p>
      </div>
      <ComingSoon
        title="Reports Module"
        description="Generate and export detailed reports for analysis and stakeholder communication."
      />
    </div>
  );
}
