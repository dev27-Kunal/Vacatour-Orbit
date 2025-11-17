import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';

interface BureauMetric {
  bureau_id: string;
  bureau_name: string;
  jobs_distributed: number;
  placements_made: number;
  fill_rate_percentage: number;
  avg_time_to_fill_days: number;
  avg_response_time_hours: number;
  current_performance_tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  current_performance_score: number;
  unique_candidates_submitted: number;
}

interface Props {
  dateRange: { start: string; end: string };
  detailed?: boolean;
}

const TIER_COLORS = {
  PLATINUM: '#8B5CF6',
  GOLD: '#F59E0B',
  SILVER: '#9CA3AF',
  BRONZE: '#A16207'
};

export default function BureauPerformanceChart({ dateRange, detailed = false }: Props) {
  const [bureauData, setBureauData] = useState<BureauMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'fill_rate' | 'placements' | 'score'>('score');

  useEffect(() => {
    fetchBureauPerformance();
  }, [dateRange]);

  const fetchBureauPerformance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/vms/analytics/bureau-comparison?start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await response.json();
      setBureauData(data);
    } catch (error) {
      console.error('Failed to fetch bureau performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...bureauData].sort((a, b) => {
    switch (sortBy) {
      case 'fill_rate':
        return b.fill_rate_percentage - a.fill_rate_percentage;
      case 'placements':
        return b.placements_made - a.placements_made;
      case 'score':
      default:
        return b.current_performance_score - a.current_performance_score;
    }
  }).slice(0, detailed ? 20 : 10);

  const chartData = sortedData.map(bureau => ({
    name: (bureau.bureau_name || 'Unknown').toString().substring(0, 15),
    fillRate: Number(bureau.fill_rate_percentage || 0),
    placements: Number(bureau.placements_made || 0),
    score: Number(bureau.current_performance_score || 0),
    tier: (bureau.current_performance_tier as any) || 'BRONZE',
    responseTime: Number(bureau.avg_response_time_hours || 0)
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${detailed ? '' : ''}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Bureau Performance Rankings
          </h2>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="score">Performance Score</option>
              <option value="fill_rate">Fill Rate</option>
              <option value="placements">Placements</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Top performing bureaus ranked by {sortBy.replace('_', ' ')}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">Tier: {data.tier}</p>
                    <p className="text-sm">Fill Rate: {data.fillRate}%</p>
                    <p className="text-sm">Placements: {data.placements}</p>
                    <p className="text-sm">Score: {data.score}</p>
                    <p className="text-sm">Response: {data.responseTime}h</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar
            dataKey={sortBy === 'fill_rate' ? 'fillRate' : sortBy === 'placements' ? 'placements' : 'score'}
            name={sortBy === 'fill_rate' ? 'Fill Rate (%)' : sortBy === 'placements' ? 'Placements' : 'Performance Score'}
            fill="#3B82F6"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.tier as keyof typeof TIER_COLORS] || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {detailed && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Detailed Bureau Metrics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bureau
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fill Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placements
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time to Fill
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((bureau) => (
                  <tr key={bureau.bureau_id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bureau.bureau_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor: `${TIER_COLORS[bureau.current_performance_tier]}20`,
                          color: TIER_COLORS[bureau.current_performance_tier]
                        }}
                      >
                        {bureau.current_performance_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{bureau.fill_rate_percentage}%</span>
                        {bureau.fill_rate_percentage > 70 ? (
                          <TrendingUp className="ml-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="ml-1 h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bureau.placements_made}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bureau.avg_time_to_fill_days} days
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bureau.avg_response_time_hours} hours
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {bureau.current_performance_score}
                        </span>
                        {bureau.current_performance_score >= 80 && (
                          <Award className="ml-1 h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <div key={tier} className="flex items-center space-x-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-xs text-gray-600">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
