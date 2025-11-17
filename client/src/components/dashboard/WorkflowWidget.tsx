import React, { useEffect, useState } from 'react';
import { GitBranch, Play, CheckCircle, XCircle, Clock, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { apiGet } from '@/lib/api-client';

interface WorkflowStats {
  activeWorkflows: number;
  executionsToday: number;
  successRate: number;
  timeSaved: number;
  recentExecutions: Array<{
    id: string;
    name: string;
    status: 'SUCCESS' | 'FAILED' | 'RUNNING';
    timestamp: string;
  }>;
}

export default function WorkflowWidget() {
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowStats();
  }, []);

  const fetchWorkflowStats = async () => {
    try {
      const response = await apiGet('/api/vms/workflows/stats');
      setStats(response.data || null);
    } catch (error) {
      // Mock data
      setStats({
        activeWorkflows: 8,
        executionsToday: 47,
        successRate: 94,
        timeSaved: 156,
        recentExecutions: [
          {
            id: '1',
            name: 'Auto Bureau Selection',
            status: 'SUCCESS',
            timestamp: '2025-01-27T15:30:00Z'
          },
          {
            id: '2',
            name: 'Candidate Screening',
            status: 'RUNNING',
            timestamp: '2025-01-27T16:00:00Z'
          },
          {
            id: '3',
            name: 'Weekly Report',
            status: 'SUCCESS',
            timestamp: '2025-01-27T14:00:00Z'
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

  const statusIcons = {
    SUCCESS: <CheckCircle className="h-4 w-4 text-green-500" />,
    FAILED: <XCircle className="h-4 w-4 text-red-500" />,
    RUNNING: <Clock className="h-4 w-4 text-blue-500 animate-spin" />
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Workflow Automation</h3>
        </div>
        <Link href="/workflows">
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            Manage
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-purple-700">Active Workflows</span>
            <GitBranch className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-purple-900">{stats.activeWorkflows}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-700">Today's Runs</span>
            <Zap className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-900">{stats.executionsToday}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-green-700">Success Rate</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-900">{stats.successRate}%</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-yellow-700">Time Saved</span>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-xl font-bold text-yellow-900">{stats.timeSaved}h</p>
        </div>
      </div>

      {/* Recent Executions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Executions</h4>
        <div className="space-y-2">
          {stats.recentExecutions.map((execution) => (
            <div key={execution.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                {statusIcons[execution.status]}
                <span className="text-sm text-gray-900">{execution.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(execution.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <Link href="/workflows/builder">
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            <Play className="h-3 w-3 mr-1" />
            Create Workflow
          </button>
        </Link>
        <Link href="/workflows#executions">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            View All Executions →
          </button>
        </Link>
      </div>
    </div>
  );
}