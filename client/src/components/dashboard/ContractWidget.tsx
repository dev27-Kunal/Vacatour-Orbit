import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { apiGet } from '@/lib/api-client';

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  expiringThisMonth: number;
  pendingSignatures: number;
  complianceRate: number;
  totalValue: number;
  upcomingRenewals: Array<{
    id: string;
    bureau: string;
    contractNumber: string;
    daysUntilExpiry: number;
    value: number;
  }>;
}

export default function ContractWidget() {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractStats();
  }, []);

  const fetchContractStats = async () => {
    try {
      const response = await apiGet('/api/vms/contracts/widget-stats');
      setStats(response.data || null);
    } catch (error) {
      // Mock data
      setStats({
        totalContracts: 156,
        activeContracts: 142,
        expiringThisMonth: 8,
        pendingSignatures: 3,
        complianceRate: 94,
        totalValue: 2450000,
        upcomingRenewals: [
          {
            id: '1',
            bureau: 'TechRecruit Solutions',
            contractNumber: 'MSA-2025-001',
            daysUntilExpiry: 15,
            value: 250000
          },
          {
            id: '2',
            bureau: 'Global Staffing',
            contractNumber: 'SOW-2025-042',
            daysUntilExpiry: 22,
            value: 75000
          },
          {
            id: '3',
            bureau: 'Elite Recruitment',
            contractNumber: 'RATE-2025-018',
            daysUntilExpiry: 28,
            value: 180000
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    return `€${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Contract Management</h3>
        </div>
        <Link href="/contracts">
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </Link>
      </div>

      {/* Alert Banner */}
      {(stats.expiringThisMonth > 0 || stats.pendingSignatures > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
            <div className="flex-1">
              {stats.pendingSignatures > 0 && (
                <p className="text-sm text-yellow-800 font-medium">
                  {stats.pendingSignatures} contract{stats.pendingSignatures > 1 ? 's' : ''} pending signature
                </p>
              )}
              {stats.expiringThisMonth > 0 && (
                <p className="text-sm text-yellow-700">
                  {stats.expiringThisMonth} contract{stats.expiringThisMonth > 1 ? 's' : ''} expiring this month
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Active Contracts</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold">{stats.activeContracts}</p>
          <div className="mt-1">
            <span className="text-xs text-gray-500">of {stats.totalContracts} total</span>
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Total Value</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.totalValue)}</p>
          <div className="mt-1">
            <span className="text-xs text-gray-500">annual contracts</span>
          </div>
        </div>
      </div>

      {/* Compliance Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Compliance Rate</span>
          <span className="text-sm font-semibold text-gray-900">{stats.complianceRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 rounded-full h-2 transition-all"
            style={{ width: `${stats.complianceRate}%` }}
          ></div>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Renewals</h4>
        <div className="space-y-2">
          {stats.upcomingRenewals.map((renewal) => (
            <div key={renewal.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-900">{renewal.contractNumber}</p>
                <p className="text-xs text-gray-500">{renewal.bureau}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(renewal.value)}</p>
                <p className="text-xs text-orange-600">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {renewal.daysUntilExpiry} days
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <Link href="/contracts/new">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            New Contract →
          </button>
        </Link>
        <Link href="/contracts#pending">
          <button className="text-sm text-orange-600 hover:text-orange-700">
            Review Pending →
          </button>
        </Link>
      </div>
    </div>
  );
}