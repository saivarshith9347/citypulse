'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('incidents');
  const [dateRange, setDateRange] = useState('7d');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch data based on report type
      const response = await fetch(`/api/${reportType}?limit=1000`);
      if (response.ok) {
        const data = await response.json();
        
        // Generate CSV
        const items = data[reportType] || data.incidents || data.buses || [];
        if (items.length === 0) {
          alert('No data available for the selected report');
          return;
        }

        const headers = Object.keys(items[0]).join(',');
        const rows = items.map((item: any) =>
          Object.values(item)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(',')
        );
        const csv = [headers, ...rows].join('\n');

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `citypulse_${reportType}_report_${new Date()
          .toISOString()
          .split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert('Report generated successfully!');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 mt-1">
          Generate and export reports for analysis and documentation
        </p>
      </div>

      {/* Report Generator */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-cyan-500" />
          <h2 className="text-lg font-semibold text-white">Generate Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="incidents">Incidents Report</option>
              <option value="buses">Fleet Status Report</option>
              <option value="work-orders">Work Orders Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Format
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate & Download Report
            </>
          )}
        </button>
      </Card>

      {/* Available Report Templates */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Incidents Summary */}
          <Card className="p-6 hover:border-cyan-700 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-8 h-8 text-cyan-500" />
              <Badge className="bg-blue-600">Standard</Badge>
            </div>
            <h3 className="font-semibold text-white mb-2">Incidents Summary</h3>
            <p className="text-sm text-slate-400 mb-4">
              Complete overview of detected incidents with status, severity, and location details
            </p>
            <div className="text-xs text-slate-500">
              Includes: Type, Status, Severity, Location, Timestamps
            </div>
          </Card>

          {/* Fleet Activity */}
          <Card className="p-6 hover:border-cyan-700 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-8 h-8 text-green-500" />
              <Badge className="bg-blue-600">Standard</Badge>
            </div>
            <h3 className="font-semibold text-white mb-2">Fleet Activity</h3>
            <p className="text-sm text-slate-400 mb-4">
              Bus fleet operational status, routes, and detection counts
            </p>
            <div className="text-xs text-slate-500">
              Includes: Bus ID, Route, Status, Last Seen, Detections
            </div>
          </Card>

          {/* Work Orders */}
          <Card className="p-6 hover:border-cyan-700 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-8 h-8 text-purple-500" />
              <Badge className="bg-blue-600">Standard</Badge>
            </div>
            <h3 className="font-semibold text-white mb-2">Work Orders</h3>
            <p className="text-sm text-slate-400 mb-4">
              Maintenance work order tracking with assignments and completion status
            </p>
            <div className="text-xs text-slate-500">
              Includes: Order ID, Department, Priority, Status, Dates
            </div>
          </Card>

          {/* Road Health */}
          <Card className="p-6 hover:border-cyan-700 transition-colors cursor-pointer opacity-60">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-8 h-8 text-amber-500" />
              <Badge className="bg-slate-600">Custom</Badge>
            </div>
            <h3 className="font-semibold text-white mb-2">Road Health Analysis</h3>
            <p className="text-sm text-slate-400 mb-4">
              Infrastructure condition scoring and maintenance priority assessment
            </p>
            <div className="text-xs text-slate-500">
              Coming soon - Custom report builder required
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6 hover:border-cyan-700 transition-colors cursor-pointer opacity-60">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-8 h-8 text-red-500" />
              <Badge className="bg-slate-600">Custom</Badge>
            </div>
            <h3 className="font-semibold text-white mb-2">Performance Metrics</h3>
            <p className="text-sm text-slate-400 mb-4">
              Response times, resolution rates, and system efficiency analytics
            </p>
            <div className="text-xs text-slate-500">
              Coming soon - Custom report builder required
            </div>
          </Card>

          {/* Monthly Summary */}
          <Card className="p-6 hover:border-cyan-700 transition-colors cursor-pointer opacity-60">
            <div className="flex items-start justify-between mb-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <Badge className="bg-slate-600">Scheduled</Badge>
            </div>
            <h3 className="font-semibold text-white mb-2">Monthly Summary</h3>
            <p className="text-sm text-slate-400 mb-4">
              Automated monthly report with trends, insights, and key metrics
            </p>
            <div className="text-xs text-slate-500">
              Coming soon - Scheduled reports feature
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
