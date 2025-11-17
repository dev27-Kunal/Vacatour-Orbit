import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface SpendData {
  month: string;
  totalSpend: number;
  bureauCount: number;
  avgSpendPerBureau: number;
  topCategory: string;
  budgetStatus: 'UNDER' | 'ON_TRACK' | 'WARNING' | 'OVER';
}

interface BureauSpend {
  bureau_name: string;
  total_spend: number;
  percentage: number;
}

interface SpendAnalysisResponse {
  monthlyData?: SpendData[];
  totalSpend?: number;
}

interface BureauSummaryResponse {
  bureauSpend?: BureauSpend[];
}

interface Props {
  dateRange: { start: string; end: string };
  detailed?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function SpendAnalysisWidget({ dateRange, detailed = false }: Props) {
  const [spendData, setSpendData] = useState<SpendData[]>([]);
  const [bureauSpend, setBureauSpend] = useState<BureauSpend[]>([]);
  const [totalBudget, setTotalBudget] = useState(500000);
  const [currentSpend, setCurrentSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'trend' | 'distribution' | 'comparison'>('trend');

  useEffect(() => {
    fetchSpendAnalysis();
  }, [dateRange]);

  const fetchSpendAnalysis = async () => {
    setLoading(true);
    try {
      const [spendRes, bureauRes] = await Promise.all([
        apiGet<SpendAnalysisResponse>(`/api/vms/analytics/spend-analysis`, { start: dateRange.start, end: dateRange.end }),
        apiGet<BureauSummaryResponse>(`/api/vms/analytics/spend-summary`, { start: dateRange.start, end: dateRange.end })
      ]);

      const spendAnalysis = spendRes?.data;
      const bureauSummary = bureauRes?.data;

      setSpendData(spendAnalysis?.monthlyData || []);
      setBureauSpend(bureauSummary?.bureauSpend || []);
      setCurrentSpend(spendAnalysis?.totalSpend || 0);
    } catch (error) {
      console.error('Failed to fetch spend analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const budgetUtilization = (currentSpend / totalBudget) * 100;
  const remainingBudget = totalBudget - currentSpend;

  const getBudgetStatus = () => {
    if (budgetUtilization < 70) {return { color: 'text-green-500', bg: 'bg-green-100', label: 'On Track' };}
    if (budgetUtilization < 90) {return { color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Warning' };}
    return { color: 'text-red-500', bg: 'bg-red-100', label: 'Over Budget Risk' };
  };

  const budgetStatus = getBudgetStatus();

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
    <div className={`bg-white rounded-lg shadow-sm p-6 ${detailed ? 'col-span-2' : ''}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Spend Analysis
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('trend')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'trend' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Trend
            </button>
            <button
              onClick={() => setViewMode('distribution')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'distribution' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Distribution
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'comparison' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              Comparison
            </button>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Budget</span>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">€{(totalBudget / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Spend</span>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">€{(currentSpend / 1000).toFixed(0)}K</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{budgetUtilization.toFixed(1)}% utilized</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Status</span>
            <AlertTriangle className={`h-4 w-4 ${budgetStatus.color}`} />
          </div>
          <p className={`text-lg font-semibold ${budgetStatus.color}`}>
            {budgetStatus.label}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            €{(remainingBudget / 1000).toFixed(0)}K remaining
          </p>
        </div>
      </div>

      {/* Chart Area */}
      {viewMode === 'trend' && (
        <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
          <AreaChart data={spendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `€${(value / 1000).toFixed(1)}K`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalSpend"
              name="Total Spend"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {viewMode === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bureauSpend.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ bureau_name, percentage }) => `${bureau_name || 'Unknown'}: ${percentage ?? 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_spend"
              >
                {bureauSpend.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `€${(value / 1000).toFixed(1)}K`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 mb-3">Top Bureau Spend</h3>
            {bureauSpend.slice(0, 5).map((bureau, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-700">{bureau.bureau_name}</span>
                </div>
                <span className="text-sm font-semibold">
                  €{(bureau.total_spend / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'comparison' && (
        <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
          <LineChart data={spendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalSpend"
              name="Actual Spend"
              stroke="#3B82F6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="budgetTarget"
              name="Budget Target"
              stroke="#10B981"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Detailed Table */}
      {detailed && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Monthly Spend Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Spend
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bureau Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avg per Bureau
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Top Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spendData.map((month, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      €{(month.totalSpend / 1000).toFixed(1)}K
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {month.bureauCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      €{(month.avgSpendPerBureau / 1000).toFixed(1)}K
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {month.topCategory}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        month.budgetStatus === 'UNDER' ? 'bg-green-100 text-green-800' :
                        month.budgetStatus === 'ON_TRACK' ? 'bg-blue-100 text-blue-800' :
                        month.budgetStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {month.budgetStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
