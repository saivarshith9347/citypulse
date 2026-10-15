'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, RefreshCw, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { IncidentCategoryChart, SeverityChart } from '@/components/dashboard/IncidentChart';

interface AnalyticsData {
  totalIncidents: number;
  avgResponseTime: number;
  trendsUp: boolean;
  detectionRate: number;
  incidentsByHour: Array<{ hour: number; count: number }>;
  incidentsByDay: Array<{ day: string; count: number }>;
}

export default function AnalyticsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/incidents?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const allIncidents = data.incidents || [];
        setIncidents(allIncidents);

        // Calculate analytics
        const now = new Date();
        const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
        const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

        const filteredIncidents = allIncidents.filter(
          (inc: any) => new Date(inc.detected_at) >= cutoff
        );

        // Incidents by hour of day
        const hourCounts = new Array(24).fill(0);
        filteredIncidents.forEach((inc: any) => {
          const hour = new Date(inc.detected_at).getHours();
          hourCounts[hour]++;
        });

        const incidentsByHour = hourCounts.map((count, hour) => ({ hour, count }));

        // Incidents by day
        const dayCounts: Record<string, number> = {};
        filteredIncidents.forEach((inc: any) => {
          const day = new Date(inc.detected_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        const incidentsByDay = Object.entries(dayCounts).map(([day, count]) => ({
          day,
          count,
        }));

        // Avg response time (mock calculation - would be real in production)
        const avgResponseTime = 45; // minutes

        // Detection rate
        const detectionRate = Math.round(
          (filteredIncidents.filter((i: any) => i.confidence >= 80).length /
            filteredIncidents.length) *
            100
        );

        setAnalytics({
          totalIncidents: filteredIncidents.length,
          avgResponseTime,
          trendsUp: filteredIncidents.length > 50,
          detectionRate: isNaN(detectionRate) ? 0 : detectionRate,
          incidentsByHour,
          incidentsByDay,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traffic & Incident Analytics</h1>
          <p className="text-slate-400 mt-1">
            Insights and trends from road monitoring data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading || !analytics ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Incidents</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analytics.totalIncidents}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-cyan-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analytics.avgResponseTime}m
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Detection Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analytics.detectionRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Trend</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analytics.trendsUp ? '↑' : '↓'}
                  </p>
                </div>
                <TrendingUp
                  className={`w-8 h-8 ${
                    analytics.trendsUp ? 'text-red-500' : 'text-green-500'
                  }`}
                />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncidentCategoryChart incidents={incidents} isDemoData={false} />
            <SeverityChart incidents={incidents} isDemoData={false} />
          </div>

          {/* Time-based Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidents by Hour */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold text-white">Incidents by Hour of Day</h3>
              </div>
              <div className="space-y-2">
                {analytics.incidentsByHour
                  .filter((h) => h.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)
                  .map((item) => (
                    <div key={item.hour} className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 w-16">
                        {item.hour}:00
                      </span>
                      <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-cyan-600"
                          style={{
                            width: `${
                              (item.count /
                                Math.max(...analytics.incidentsByHour.map((h) => h.count))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-8">{item.count}</span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Incidents by Day */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold text-white">Recent Daily Incidents</h3>
              </div>
              <div className="space-y-2">
                {analytics.incidentsByDay.slice(0, 10).map((item) => (
                  <div key={item.day} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-20">{item.day}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(...analytics.incidentsByDay.map((d) => d.count))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
