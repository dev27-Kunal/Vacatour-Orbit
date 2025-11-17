import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface BenchmarkData {
  category: string;
  seniorityLevel: string;
  marketAvg: number;
  companyAvg: number;
  difference: number;
  percentageDiff: number;
}

export default function MarketBenchmarkChart() {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Software Development');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
  }, [selectedCategory]);

  const fetchBenchmarks = async () => {
    setLoading(true);
    try {
      const response = await apiGet<BenchmarkData[]>(`/api/vms/analytics/market-benchmarks`, { category: selectedCategory });
      setBenchmarkData(response?.data || []);
    } catch (error) {
      // Use mock data for demo
      setBenchmarkData([
        { category: 'Software Dev', seniorityLevel: 'Junior', marketAvg: 45, companyAvg: 42, difference: -3, percentageDiff: -6.7 },
        { category: 'Software Dev', seniorityLevel: 'Medior', marketAvg: 65, companyAvg: 68, difference: 3, percentageDiff: 4.6 },
        { category: 'Software Dev', seniorityLevel: 'Senior', marketAvg: 85, companyAvg: 83, difference: -2, percentageDiff: -2.4 },
        { category: 'Software Dev', seniorityLevel: 'Lead', marketAvg: 105, companyAvg: 110, difference: 5, percentageDiff: 4.8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Market Rate Benchmark</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm"
        >
          <option value="Software Development">Software Development</option>
          <option value="Data Science">Data Science</option>
          <option value="Product Management">Product Management</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={benchmarkData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="seniorityLevel" />
          <YAxis />
          <Tooltip formatter={(value) => `€${value}/hr`} />
          <Legend />
          <Bar dataKey="marketAvg" name="Market Average" fill="#9CA3AF" />
          <Bar dataKey="companyAvg" name="Your Average" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {benchmarkData.map((item) => (
          <div key={item.seniorityLevel} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{item.seniorityLevel}</span>
            <div className="flex items-center space-x-2">
              <span className={item.difference > 0 ? 'text-green-600' : 'text-red-600'}>
                {item.difference > 0 ? '+' : ''}{item.percentageDiff.toFixed(1)}%
              </span>
              {item.difference > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}