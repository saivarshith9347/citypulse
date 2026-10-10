import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">settings module</p>
      </div>
      <ComingSoon
        title="Settings Module"
        description="System configuration, user management, and application preferences."
      />
    </div>
  );
}
