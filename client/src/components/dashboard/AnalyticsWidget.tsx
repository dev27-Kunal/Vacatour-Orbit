import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface AnalyticsData {
  totalPlacements: number;
  placementGrowth: number;
  avgTimeToFill: number;
  timeToFillTrend: number;
  totalSpend: number;
  spendEfficiency: number;
  activeBureaus: number;
  bureauPerformance: number;
}

export default function AnalyticsWidget() {
  // Mock data - replace with API call
  const data: AnalyticsData = {
    totalPlacements: 234,
    placementGrowth: 12,
    avgTimeToFill: 14,
    timeToFillTrend: -3,
    totalSpend: 450000,
    spendEfficiency: 94,
    activeBureaus: 28,
    bureauPerformance: 88
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Analytics Overview</h3>
        </div>
        <Link href="/analytics">
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Placements */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Placements</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{data.totalPlacements}</p>
          <div className="flex items-center mt-1">
            {data.placementGrowth > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+{data.placementGrowth}%</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3 text-red-500 mr-1 rotate-180" />
                <span className="text-xs text-red-600">{data.placementGrowth}%</span>
              </>
            )}
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        {/* Time to Fill */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Avg Time to Fill</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{data.avgTimeToFill} days</p>
          <div className="flex items-center mt-1">
            {data.timeToFillTrend < 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500 mr-1 rotate-180" />
                <span className="text-xs text-green-600">{Math.abs(data.timeToFillTrend)} days faster</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs text-red-600">{data.timeToFillTrend} days slower</span>
              </>
            )}
          </div>
        </div>

        {/* Total Spend */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Total Spend</span>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">€{(data.totalSpend / 1000).toFixed(0)}K</p>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-600">{data.spendEfficiency}% efficiency</span>
          </div>
        </div>

        {/* Bureau Performance */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Bureau Performance</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{data.bureauPerformance}%</p>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-600">{data.activeBureaus} active bureaus</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Link href="/analytics">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              View Full Dashboard →
            </button>
          </Link>
          <Link href="/analytics#forecasting">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              See Predictions →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}