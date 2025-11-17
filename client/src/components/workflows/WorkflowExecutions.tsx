import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle, XCircle, AlertCircle, Clock,
  ChevronRight, ChevronDown, RefreshCw, Filter, Download
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api-client';

interface WorkflowExecution {
  id: string;
  workflow_name: string;
  workflow_id: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  trigger_type: string;
  trigger_data: any;
  steps: Array<{
    id: string;
    name: string;
    status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'SKIPPED';
    started_at: string;
    completed_at: string | null;
    output?: any;
    error?: string;
  }>;
  error?: string;
}

const statusColors = {
  SUCCESS: 'text-green-600 bg-green-100',
  FAILED: 'text-red-600 bg-red-100',
  RUNNING: 'text-blue-600 bg-blue-100',
  PENDING: 'text-gray-600 bg-gray-100',
  SKIPPED: 'text-gray-400 bg-gray-50'
};

const statusIcons = {
  SUCCESS: CheckCircle,
  FAILED: XCircle,
  RUNNING: RefreshCw,
  PENDING: Clock,
  SKIPPED: AlertCircle
};

export default function WorkflowExecutions() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'FAILED' | 'RUNNING'>('ALL');
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchExecutions();
    // Set up polling for running executions
    const interval = setInterval(() => {
      if (executions.some(e => e.status === 'RUNNING')) {
        fetchExecutions();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [filterStatus, dateRange]);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const response = await apiGet(`/api/vms/workflows/executions`, {
        status: filterStatus,
        range: dateRange
      });
      setExecutions(response.data || []);
    } catch (error) {
      // Mock data for demo
      setExecutions([
        {
          id: '1',
          workflow_name: 'Auto Bureau Selection',
          workflow_id: 'wf_1',
          status: 'SUCCESS',
          started_at: '2025-01-27T15:30:00Z',
          completed_at: '2025-01-27T15:30:45Z',
          duration_seconds: 45,
          trigger_type: 'JOB_CREATED',
          trigger_data: { job_id: 'job_123', title: 'Senior Developer' },
          steps: [
            {
              id: 's1',
              name: 'Check Job Requirements',
              status: 'SUCCESS',
              started_at: '2025-01-27T15:30:00Z',
              completed_at: '2025-01-27T15:30:05Z',
              output: { requirements_count: 5, priority: 'HIGH' }
            },
            {
              id: 's2',
              name: 'Find Matching Bureaus',
              status: 'SUCCESS',
              started_at: '2025-01-27T15:30:05Z',
              completed_at: '2025-01-27T15:30:20Z',
              output: { bureaus_found: 8, top_matches: 3 }
            },
            {
              id: 's3',
              name: 'Send Notifications',
              status: 'SUCCESS',
              started_at: '2025-01-27T15:30:20Z',
              completed_at: '2025-01-27T15:30:45Z',
              output: { emails_sent: 3, notifications_sent: 3 }
            }
          ]
        },
        {
          id: '2',
          workflow_name: 'Candidate Auto-Screening',
          workflow_id: 'wf_2',
          status: 'FAILED',
          started_at: '2025-01-27T14:15:00Z',
          completed_at: '2025-01-27T14:15:30Z',
          duration_seconds: 30,
          trigger_type: 'APPLICATION_RECEIVED',
          trigger_data: { application_id: 'app_456', candidate: 'John Doe' },
          steps: [
            {
              id: 's1',
              name: 'Parse Resume',
              status: 'SUCCESS',
              started_at: '2025-01-27T14:15:00Z',
              completed_at: '2025-01-27T14:15:10Z',
              output: { skills_extracted: 12, experience_years: 5 }
            },
            {
              id: 's2',
              name: 'Check Requirements',
              status: 'SUCCESS',
              started_at: '2025-01-27T14:15:10Z',
              completed_at: '2025-01-27T14:15:20Z',
              output: { requirements_met: 7, total_requirements: 10 }
            },
            {
              id: 's3',
              name: 'Send Notification',
              status: 'FAILED',
              started_at: '2025-01-27T14:15:20Z',
              completed_at: '2025-01-27T14:15:30Z',
              error: 'Email service unavailable'
            }
          ],
          error: 'Failed to complete workflow: Email service unavailable'
        },
        {
          id: '3',
          workflow_name: 'Weekly Performance Report',
          workflow_id: 'wf_3',
          status: 'RUNNING',
          started_at: '2025-01-27T16:00:00Z',
          completed_at: null,
          duration_seconds: null,
          trigger_type: 'SCHEDULED',
          trigger_data: { schedule: 'weekly', day: 'friday' },
          steps: [
            {
              id: 's1',
              name: 'Collect Data',
              status: 'SUCCESS',
              started_at: '2025-01-27T16:00:00Z',
              completed_at: '2025-01-27T16:00:30Z',
              output: { records_collected: 1250 }
            },
            {
              id: 's2',
              name: 'Generate Report',
              status: 'RUNNING',
              started_at: '2025-01-27T16:00:30Z',
              completed_at: null
            },
            {
              id: 's3',
              name: 'Send Report',
              status: 'PENDING',
              started_at: '',
              completed_at: null
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryExecution = async (executionId: string) => {
    try {
      await apiPost(`/api/vms/workflows/executions/${executionId}/retry`);
      fetchExecutions();
    } catch (error) {
      console.error('Failed to retry execution:', error);
    }
  };

  const exportExecutions = () => {
    // Export logic here
    console.log('Exporting executions...');
  };

  const filteredExecutions = filterStatus === 'ALL'
    ? executions
    : executions.filter(e => e.status === filterStatus);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) {return '-';}
    if (seconds < 60) {return `${seconds}s`;}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;}
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="ALL">All Executions</option>
            <option value="SUCCESS">Successful</option>
            <option value="FAILED">Failed</option>
            <option value="RUNNING">Running</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button
          onClick={exportExecutions}
          className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 flex items-center space-x-1"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Executions List */}
      <div className="space-y-4">
        {filteredExecutions.map((execution) => {
          const StatusIcon = statusIcons[execution.status];
          const isExpanded = selectedExecution === execution.id;

          return (
            <div key={execution.id} className="bg-white border rounded-lg">
              {/* Execution Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedExecution(isExpanded ? null : execution.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-400">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    <StatusIcon className={`h-5 w-5 ${statusColors[execution.status].split(' ')[0]}`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{execution.workflow_name}</h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                        <span>{execution.trigger_type}</span>
                        <span>•</span>
                        <span>{new Date(execution.started_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>{formatDuration(execution.duration_seconds)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[execution.status]}`}>
                      {execution.status}
                    </span>
                    {execution.status === 'FAILED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          retryExecution(execution.id);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Execution Details */}
              {isExpanded && (
                <div className="border-t px-4 pb-4">
                  {/* Trigger Data */}
                  <div className="mt-4 mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Trigger Data</h5>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(execution.trigger_data, null, 2)}
                    </pre>
                  </div>

                  {/* Steps */}
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Execution Steps</h5>
                  <div className="space-y-2">
                    {execution.steps.map((step, idx) => {
                      const StepIcon = statusIcons[step.status];
                      return (
                        <div key={step.id} className="flex items-start space-x-3">
                          <div className="flex items-center mt-0.5">
                            <StepIcon className={`h-4 w-4 ${statusColors[step.status].split(' ')[0]}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{step.name}</span>
                              <span className="text-xs text-gray-500">
                                {step.completed_at
                                  ? formatDuration(
                                      Math.floor((new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000)
                                    )
                                  : step.status === 'RUNNING'
                                  ? 'Running...'
                                  : '-'}
                              </span>
                            </div>
                            {step.error && (
                              <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded">
                                {step.error}
                              </div>
                            )}
                            {step.output && (
                              <div className="mt-1 text-xs text-gray-600">
                                Output: {JSON.stringify(step.output)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Error Message */}
                  {execution.error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">{execution.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredExecutions.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No workflow executions found</p>
        </div>
      )}
    </div>
  );
}