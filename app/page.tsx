import Link from 'next/link';
import { Radio, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center max-w-2xl px-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl">
            <Radio className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-white mb-4">
          CityPulse AI
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Smart India Hackathon 2026
        </p>
        <p className="text-lg text-gray-300 mb-12 max-w-xl mx-auto">
          AI-powered urban infrastructure monitoring using public transport fleet
          as mobile sensing units for road damage detection and traffic analysis.
        </p>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Open Command Center
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-slate-850/50 border border-slate-700 rounded-lg">
            <h3 className="text-cyan-400 font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-sm text-gray-400">
              Live bus fleet tracking and instant incident detection
            </p>
          </div>
          <div className="p-6 bg-slate-850/50 border border-slate-700 rounded-lg">
            <h3 className="text-cyan-400 font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-gray-400">
              YOLO-based road damage detection with high accuracy
            </p>
          </div>
          <div className="p-6 bg-slate-850/50 border border-slate-700 rounded-lg">
            <h3 className="text-cyan-400 font-semibold mb-2">Workflow Management</h3>
            <p className="text-sm text-gray-400">
              Complete maintenance workflow from detection to resolution
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-gray-500">
          <p>Transforming urban infrastructure maintenance with AI</p>
        </div>
      </div>
    </div>
  );
}
