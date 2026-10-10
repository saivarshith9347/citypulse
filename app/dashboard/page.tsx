import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentIncidents } from '@/components/dashboard/RecentIncidents';
import { IncidentCategoryChart, SeverityChart } from '@/components/dashboard/IncidentChart';
import { FleetStatus } from '@/components/dashboard/FleetStatus';
import { 
  AlertTriangle, 
  AlertCircle, 
  Bus, 
  Clock, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';
import { getRecentIncidents, getIncidentStats } from '@/lib/db/incidents';
import { getBusesWithDetectionCounts, getBusStats } from '@/lib/db/buses';
import { sampleIncidents, sampleBuses, getDashboardStats } from '@/lib/data/sample-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    // Try to fetch real data from Supabase
    const [incidents, buses, incidentStats, busStats] = await Promise.all([
      getRecentIncidents(10),
      getBusesWithDetectionCounts(),
      getIncidentStats(),
      getBusStats(),
    ]);

    return {
      incidents: incidents || [],
      buses: buses || [],
      stats: {
        ...incidentStats,
        active_buses: busStats.active_buses,
      },
      usingRealData: true,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data, using demo data:', error);
    // Fallback to sample data
    return {
      incidents: sampleIncidents,
      buses: sampleBuses,
      stats: getDashboardStats(sampleIncidents),
      usingRealData: false,
    };
  }
}

export default async function DashboardPage() {
  const { incidents, buses, stats, usingRealData } = await getDashboardData();

  // Get recent incidents (last 5)
  const recentIncidents = incidents.slice(0, 5).map(incident => ({
    ...incident,
    type: incident.event_type,
    status: incident.verification_status,
    location: {
      lat: Number(incident.latitude),
      lng: Number(incident.longitude),
      address: incident.description || 'Location data',
    },
    bus_number: incident.buses?.bus_code,
    confidence: Number(incident.confidence),
    detected_at: incident.detected_at,
    is_demo: !usingRealData,
  }));

  // Transform buses data
  const transformedBuses = buses.map(bus => ({
    id: bus.id,
    number: bus.bus_code,
    route: bus.route_name,
    status: bus.status as 'online' | 'offline' | 'maintenance',
    location: {
      lat: Number(bus.last_latitude) || 0,
      lng: Number(bus.last_longitude) || 0,
    },
    last_ping: bus.last_seen_at,
    detection_count: bus.detection_count || 0,
    is_demo: !usingRealData,
  }));

  // Transform incidents for charts
  const transformedIncidents = incidents.map(incident => ({
    id: incident.id,
    type: incident.event_type as any,
    severity: incident.severity as any,
    status: incident.verification_status as any,
    confidence: Number(incident.confidence),
    location: {
      lat: Number(incident.latitude),
      lng: Number(incident.longitude),
    },
    detected_at: incident.detected_at,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center Overview</h1>
          <p className="text-gray-400 mt-1">
            Real-time monitoring and analytics for CityPulse AI
          </p>
        </div>
        {!usingRealData && (
          <Badge variant="warning" className="text-sm">
            ⚠️ Using Demo Data - Database Not Connected
          </Badge>
        )}
      </div>

      {/* Database Status Alert */}
      {!usingRealData && (
        <Card className="border-yellow-700 bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-200">
                  Database Not Configured
                </p>
                <p className="text-xs text-yellow-300/80 mt-1">
                  Displaying demo data. To use real data, run the SQL schema in your Supabase project. 
                  See <code className="bg-slate-900 px-1 py-0.5 rounded">supabase/schema.sql</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Incidents"
          value={stats.total_incidents}
          change="+12% from last week"
          changeType="neutral"
          icon={AlertTriangle}
          iconColor="text-blue-400"
        />
        <StatsCard
          title="Critical Incidents"
          value={stats.critical_incidents}
          change="Requires immediate attention"
          changeType="negative"
          icon={AlertCircle}
          iconColor="text-red-400"
        />
        <StatsCard
          title="Active Buses"
          value={stats.active_buses}
          change={`${stats.active_buses} of ${transformedBuses.length} online`}
          changeType="positive"
          icon={Bus}
          iconColor="text-green-400"
        />
        <StatsCard
          title="Awaiting Verification"
          value={stats.pending_verification}
          change="Pending operator review"
          changeType="neutral"
          icon={Clock}
          iconColor="text-yellow-400"
        />
        <StatsCard
          title="In Progress"
          value={stats.in_progress}
          change="Being addressed"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-cyan-400"
        />
        <StatsCard
          title="Resolved Today"
          value={stats.resolved_today}
          change="Completed work orders"
          changeType="positive"
          icon={CheckCircle2}
          iconColor="text-green-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncidentCategoryChart incidents={transformedIncidents} isDemoData={!usingRealData} />
        <SeverityChart incidents={transformedIncidents} isDemoData={!usingRealData} />
      </div>

      {/* Recent Incidents and Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentIncidents incidents={recentIncidents} />
        </div>
        <div>
          <FleetStatus buses={transformedBuses} />
        </div>
      </div>
    </div>
  );
}
