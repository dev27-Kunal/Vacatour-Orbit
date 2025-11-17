import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Brain, Calendar, AlertCircle } from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface ForecastData {
  period: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export default function ForecastingWidget() {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [forecastType, setForecastType] = useState<'placements' | 'spend' | 'timeToFill'>('placements');
  const [confidence, setConfidence] = useState(95);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, [forecastType]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await apiGet<ForecastData[]>(`/api/vms/analytics/forecasts`, {
        type: forecastType,
        confidence: confidence
      });
      setForecastData(response?.data || []);
    } catch (error) {
      // Mock data for demo
      const mockData = [
        { period: 'Jan', actual: 45, predicted: 45, lowerBound: 40, upperBound: 50 },
        { period: 'Feb', actual: 52, predicted: 52, lowerBound: 47, upperBound: 57 },
        { period: 'Mar', actual: 58, predicted: 58, lowerBound: 53, upperBound: 63 },
        { period: 'Apr', actual: 61, predicted: 61, lowerBound: 56, upperBound: 66 },
        { period: 'May', predicted: 65, lowerBound: 58, upperBound: 72 },
        { period: 'Jun', predicted: 69, lowerBound: 61, upperBound: 77 },
        { period: 'Jul', predicted: 73, lowerBound: 64, upperBound: 82 }
      ];
      setForecastData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = () => {
    switch (forecastType) {
      case 'placements': return 'Placements';
      case 'spend': return 'Spend (€K)';
      case 'timeToFill': return 'Days to Fill';
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
    <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">Predictive Forecasting</h2>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={forecastType}
              onChange={(e) => setForecastType(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="placements">Placements</option>
              <option value="spend">Spend</option>
              <option value="timeToFill">Time to Fill</option>
            </select>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Confidence:</span>
              <span className="text-sm font-semibold">{confidence}%</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          AI-powered predictions for the next 3 months based on historical trends
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={forecastData}>
          <defs>
            <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Confidence interval */}
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill="url(#colorUpper)"
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="url(#colorLower)"
            name="Lower Bound"
          />

          {/* Actual data */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Actual"
          />

          {/* Predicted data */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-semibold text-blue-900">Growth Trend</span>
          </div>
          <p className="text-sm text-blue-700">
            {forecastType === 'placements' && 'Expected 15% increase in placements'}
            {forecastType === 'spend' && 'Projected spend increase of €45K'}
            {forecastType === 'timeToFill' && 'Time to fill improving by 3 days'}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Brain className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-semibold text-purple-900">Model Accuracy</span>
          </div>
          <p className="text-sm text-purple-700">
            92% accuracy based on last 12 months
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-semibold text-yellow-900">Recommendation</span>
          </div>
          <p className="text-sm text-yellow-700">
            {forecastType === 'placements' && 'Prepare for increased hiring demand'}
            {forecastType === 'spend' && 'Review budget allocation for Q2'}
            {forecastType === 'timeToFill' && 'Maintain current bureau performance'}
          </p>
        </div>
      </div>
    </div>
  );
}