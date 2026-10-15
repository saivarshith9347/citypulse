'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingDown, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoadSegmentHealth {
  route: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number;
  incidents: number;
  lastInspected: string;
}

export default function RoadHealthPage() {
  const [segments, setSegments] = useState<RoadSegmentHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoadHealth();
  }, []);

  const loadRoadHealth = async () => {
    setIsLoading(true);
    try {
      // Fetch incidents and aggregate by route
      const response = await fetch('/api/incidents?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const incidents = data.incidents || [];

        // Group by bus route (simplified - in production would aggregate by actual road segments)
        const routeMap = new Map<string, any[]>();
        incidents.forEach((inc: any) => {
          const route = inc.buses?.route_name || 'Unknown Route';
          if (!routeMap.has(route)) {
            routeMap.set(route, []);
          }
          routeMap.get(route)!.push(inc);
        });

        // Calculate health scores
        const healthData: RoadSegmentHealth[] = Array.from(routeMap.entries()).map(
          ([route, routeIncidents]) => {
            const criticalCount = routeIncidents.filter(
              (i) => i.severity === 'critical'
            ).length;
            const highCount = routeIncidents.filter((i) => i.severity === 'high').length;
            const mediumCount = routeIncidents.filter((i) => i.severity === 'medium').length;

            // Simple health scoring
            let score = 100;
            score -= criticalCount * 15;
            score -= highCount * 10;
            score -= mediumCount * 5;
            score = Math.max(0, Math.min(100, score));

            let condition: RoadSegmentHealth['condition'];
            if (score >= 90) condition = 'excellent';
            else if (score >= 75) condition = 'good';
            else if (score >= 50) condition = 'fair';
            else if (score >= 30) condition = 'poor';
            else condition = 'critical';

            const lastIncident = routeIncidents.sort((a, b) =>
              new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
            )[0];

            return {
              route,
              condition,
              score,
              incidents: routeIncidents.length,
              lastInspected: lastIncident?.detected_at || new Date().toISOString(),
            };
          }
        );

        setSegments(healthData.sort((a, b) => a.score - b.score));
      }
    } catch (error) {
      console.error('Error loading road health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const overallStats = {
    totalRoutes: segments.length,
    avgScore: segments.length > 0
      ? Math.round(segments.reduce((sum, s) => sum + s.score, 0) / segments.length)
      : 0,
    critical: segments.filter((s) => s.condition === 'critical').length,
    needsAttention: segments.filter((s) => s.condition === 'poor' || s.condition === 'critical').length,
  };

  const conditionColors: Record<string, string> = {
    excellent: 'bg-green-600',
    good: 'bg-blue-500',
    fair: 'bg-amber-500',
    poor: 'bg-orange-600',
    critical: 'bg-red-600',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Road Health Monitor</h1>
          <p className="text-slate-400 mt-1">
            Infrastructure condition analysis and scoring by route
          </p>
        </div>
        <button
          onClick={loadRoadHealth}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Monitored Routes</p>
              <p className="text-2xl font-bold text-white mt-1">{overallStats.totalRoutes}</p>
            </div>
            <Activity className="w-8 h-8 text-cyan-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Average Health Score</p>
              <p className="text-2xl font-bold text-white mt-1">{overallStats.avgScore}</p>
            </div>
            {overallStats.avgScore >= 75 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-orange-500" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Critical Routes</p>
              <p className="text-2xl font-bold text-white mt-1">{overallStats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Needs Attention</p>
              <p className="text-2xl font-bold text-white mt-1">{overallStats.needsAttention}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Road Health Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : segments.length === 0 ? (
          <CardContent className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No road health data available</p>
            <p className="text-sm text-slate-500 mt-2">
              Data will appear as incidents are detected
            </p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total Incidents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Inspected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {segments.map((segment, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">
                        {segment.route}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              segment.score >= 75
                                ? 'bg-green-500'
                                : segment.score >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${segment.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {segment.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={conditionColors[segment.condition]}>
                        {segment.condition}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {segment.incidents}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {new Date(segment.lastInspected).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
