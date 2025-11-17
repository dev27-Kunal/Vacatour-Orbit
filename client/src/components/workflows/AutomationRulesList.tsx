import React, { useState, useEffect } from 'react';
import {
  Settings, ToggleLeft, ToggleRight, Edit, Trash2,
  Users, Mail, Clock, Filter, Zap, Calendar, AlertCircle, Plus
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    parameters: any;
  }>;
  is_active: boolean;
  last_triggered: string | null;
  trigger_count: number;
  success_rate: number;
  created_at: string;
}

const triggerColors: { [key: string]: string } = {
  'JOB_CREATED': 'bg-blue-100 text-blue-700',
  'APPLICATION_RECEIVED': 'bg-green-100 text-green-700',
  'STATUS_CHANGED': 'bg-yellow-100 text-yellow-700',
  'TIME_BASED': 'bg-purple-100 text-purple-700',
  'BUREAU_ASSIGNED': 'bg-indigo-100 text-indigo-700'
};

export default function AutomationRulesList() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchAutomationRules();
  }, []);

  const fetchAutomationRules = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/vms/workflows/automation-rules');
      setRules(response.data || []);
    } catch (error) {
      // Mock data for demo
      setRules([
        {
          id: '1',
          name: 'Auto-Reject Unqualified Candidates',
          description: 'Automatically reject candidates who don\'t meet minimum requirements',
          trigger_event: 'APPLICATION_RECEIVED',
          conditions: [
            { field: 'years_experience', operator: 'less_than', value: '3' },
            { field: 'required_skills_match', operator: 'less_than', value: '60%' }
          ],
          actions: [
            { type: 'UPDATE_STATUS', parameters: { status: 'REJECTED' } },
            { type: 'SEND_EMAIL', parameters: { template: 'rejection_template' } }
          ],
          is_active: true,
          last_triggered: '2025-01-27T14:30:00Z',
          trigger_count: 234,
          success_rate: 98,
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Bureau Performance Alert',
          description: 'Alert management when bureau performance drops below threshold',
          trigger_event: 'TIME_BASED',
          conditions: [
            { field: 'bureau_success_rate', operator: 'less_than', value: '70%' },
            { field: 'time_to_fill', operator: 'greater_than', value: '14' }
          ],
          actions: [
            { type: 'SEND_EMAIL', parameters: { recipient: 'management', template: 'performance_alert' } },
            { type: 'CREATE_TASK', parameters: { title: 'Review bureau performance' } }
          ],
          is_active: true,
          last_triggered: '2025-01-26T09:00:00Z',
          trigger_count: 45,
          success_rate: 100,
          created_at: '2025-01-05T00:00:00Z'
        },
        {
          id: '3',
          name: 'Urgent Job Priority Boost',
          description: 'Automatically prioritize urgent jobs and notify top bureaus',
          trigger_event: 'JOB_CREATED',
          conditions: [
            { field: 'job_priority', operator: 'equals', value: 'URGENT' }
          ],
          actions: [
            { type: 'ASSIGN_BUREAUS', parameters: { count: 5, criteria: 'top_performing' } },
            { type: 'SEND_NOTIFICATION', parameters: { type: 'push', priority: 'high' } },
            { type: 'UPDATE_SLA', parameters: { response_time: '24h' } }
          ],
          is_active: false,
          last_triggered: null,
          trigger_count: 0,
          success_rate: 0,
          created_at: '2025-01-15T00:00:00Z'
        },
        {
          id: '4',
          name: 'Weekly Reminder for Inactive Jobs',
          description: 'Send reminders for jobs with no activity for 7 days',
          trigger_event: 'TIME_BASED',
          conditions: [
            { field: 'days_since_last_activity', operator: 'greater_than', value: '7' },
            { field: 'job_status', operator: 'equals', value: 'OPEN' }
          ],
          actions: [
            { type: 'SEND_EMAIL', parameters: { template: 'activity_reminder' } },
            { type: 'FLAG_JOB', parameters: { flag: 'needs_attention' } }
          ],
          is_active: true,
          last_triggered: '2025-01-25T00:00:00Z',
          trigger_count: 89,
          success_rate: 95,
          created_at: '2025-01-10T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, currentStatus: boolean) => {
    try {
      await apiPost(`/api/vms/workflows/automation-rules/${id}/toggle`, { is_active: !currentStatus });

      setRules(rules.map(r =>
        r.id === id ? { ...r, is_active: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) {
      return;
    }

    try {
      await apiDelete(`/api/vms/workflows/automation-rules/${id}`);

      setRules(rules.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const filteredRules = filterActive === 'all'
    ? rules
    : rules.filter(r => filterActive === 'active' ? r.is_active : !r.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filterActive === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Rules ({rules.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filterActive === 'active' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Active ({rules.filter(r => r.is_active).length})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filterActive === 'inactive' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Inactive ({rules.filter(r => !r.is_active).length})
          </button>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-start justify-between">
              {/* Rule Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${triggerColors[rule.trigger_event]}`}>
                    {rule.trigger_event.replace('_', ' ')}
                  </span>
                  {rule.is_active ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                {/* Conditions */}
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Conditions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rule.conditions.map((condition, idx) => (
                      <span key={idx} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200">
                        {condition.field} {condition.operator.replace('_', ' ')} {condition.value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rule.actions.map((action, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                        {action.type.replace('_', ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Triggered {rule.trigger_count} times</span>
                  {rule.success_rate > 0 && (
                    <span>{rule.success_rate}% success rate</span>
                  )}
                  {rule.last_triggered && (
                    <span>Last triggered {new Date(rule.last_triggered).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => toggleRule(rule.id, rule.is_active)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {rule.is_active ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedRule(rule)}
                  className="text-gray-500 hover:text-primary"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">No automation rules found</p>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Create Your First Rule
          </button>
        </div>
      )}
    </div>
  );
}