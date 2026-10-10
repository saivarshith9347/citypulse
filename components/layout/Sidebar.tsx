'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bus, 
  Map, 
  AlertTriangle, 
  Activity, 
  BarChart3,
  ClipboardList,
  FileText,
  Settings,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Fleet', href: '/dashboard/fleet', icon: Bus },
  { name: 'Incident Map', href: '/dashboard/map', icon: Map },
  { name: 'Incident Management', href: '/dashboard/incidents', icon: AlertTriangle },
  { name: 'Road Health', href: '/dashboard/road-health', icon: Activity },
  { name: 'Traffic Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Work Orders', href: '/dashboard/work-orders', icon: ClipboardList },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-700">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
          <Radio className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">CityPulse</h1>
          <p className="text-xs text-gray-400">AI Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-700/50'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-gray-200'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-400">System Online</span>
        </div>
      </div>
    </div>
  );
}
