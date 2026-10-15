'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Map, Database, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      critical: true,
      high: true,
      medium: false,
      low: false,
    },
    detection: {
      confidenceThreshold: 75,
      autoVerify: false,
    },
    map: {
      defaultZoom: 13,
      clusterMarkers: true,
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Configure CityPulse application preferences
        </p>
      </div>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-400 mb-4">
            Choose which incident severities trigger notifications
          </p>

          {['critical', 'high', 'medium', 'low'].map((severity) => (
            <label key={severity} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[severity as keyof typeof settings.notifications]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      [severity]: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
              />
              <span className="text-white capitalize">{severity} severity incidents</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Detection Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Detection Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confidence Threshold: {settings.detection.confidenceThreshold}%
            </label>
            <input
              type="range"
              min="50"
              max="99"
              value={settings.detection.confidenceThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  detection: {
                    ...settings.detection,
                    confidenceThreshold: parseInt(e.target.value),
                  },
                })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <p className="text-xs text-slate-500 mt-2">
              Only incidents with confidence above this threshold will be recorded
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.detection.autoVerify}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  detection: {
                    ...settings.detection,
                    autoVerify: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <div>
              <span className="text-white block">Auto-verify high-confidence detections</span>
              <span className="text-xs text-slate-500">
                Automatically verify incidents with confidence ≥ 90%
              </span>
            </div>
          </label>
        </div>
      </Card>

      {/* Map Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Map className="w-6 h-6 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Map Display</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Zoom Level: {settings.map.defaultZoom}
            </label>
            <input
              type="range"
              min="10"
              max="18"
              value={settings.map.defaultZoom}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  map: {
                    ...settings.map,
                    defaultZoom: parseInt(e.target.value),
                  },
                })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.map.clusterMarkers}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  map: {
                    ...settings.map,
                    clusterMarkers: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <div>
              <span className="text-white block">Cluster nearby incident markers</span>
              <span className="text-xs text-slate-500">
                Group close incidents for better map readability
              </span>
            </div>
          </label>
        </div>
      </Card>

      {/* Database Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Database Configuration</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
            <div>
              <p className="text-white font-medium">Supabase Connection</p>
              <p className="text-sm text-slate-400 mt-1">
                Configure in .env.local file
              </p>
            </div>
            <Badge className="bg-green-600">Connected</Badge>
          </div>

          <div className="text-sm text-slate-400 bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
            </p>
            <p className="font-mono text-xs mt-1">
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
            </p>
            <p className="font-mono text-xs mt-1">
              SUPABASE_SERVICE_ROLE_KEY=your_service_key
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
