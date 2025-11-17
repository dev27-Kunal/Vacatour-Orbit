import React, { useState, useEffect } from 'react';
import {
  GitBranch, Plus, Play, Pause, Settings, Zap,
  Users, FileText, Mail, Clock, Filter, CheckCircle
} from 'lucide-react';
import WorkflowBuilder from '@/components/workflows/WorkflowBuilder';
import AutomationRulesList from '@/components/workflows/AutomationRulesList';
import WorkflowTemplates from '@/components/workflows/WorkflowTemplates';
import WorkflowExecutions from '@/components/workflows/WorkflowExecutions';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  executionsToday: number;
  successRate: number;
  automationRules: number;
  timeSaved: number;
}

export default function WorkflowsDashboard() {
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'rules' | 'executions'>('templates');
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchWorkflowStats();
  }, []);

  const fetchWorkflowStats = async () => {
    setLoading(true);
    try {
      // Mock data for now
      setStats({
        totalWorkflows: 12,
        activeWorkflows: 8,
        executionsToday: 47,
        successRate: 94,
        automationRules: 15,
        timeSaved: 156
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('workflows.title', { defaultValue: 'Workflow Automation' })}</h1>
            <p className="text-gray-600">{t('workflows.subtitle', { defaultValue: 'Automate repetitive tasks and streamline your recruitment process' })}</p>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>{t('workflows.newWorkflow', { defaultValue: 'New Workflow' })}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <GitBranch className="h-5 w-5 text-blue-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
            <p className="text-xs text-gray-600">Workflows</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Play className="h-5 w-5 text-green-500" />
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats.activeWorkflows}</p>
            <p className="text-xs text-gray-600">Running</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-2xl font-bold">{stats.executionsToday}</p>
            <p className="text-xs text-gray-600">Executions</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-xs text-gray-500">Success</span>
            </div>
            <p className="text-2xl font-bold">{stats.successRate}%</p>
            <p className="text-xs text-gray-600">Rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <span className="text-xs text-gray-500">Rules</span>
            </div>
            <p className="text-2xl font-bold">{stats.automationRules}</p>
            <p className="text-xs text-gray-600">Automation Rules</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <span className="text-xs text-gray-500">Saved</span>
            </div>
            <p className="text-2xl font-bold">{stats.timeSaved}h</p>
            <p className="text-xs text-gray-600">This Month</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 ${
                activeTab === 'templates'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>{t('workflows.tabs.templates', { defaultValue: 'Templates' })}</span>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 ${
                activeTab === 'builder'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              <span>{t('workflows.tabs.builder', { defaultValue: 'Workflow Builder' })}</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 ${
                activeTab === 'rules'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>{t('workflows.tabs.rules', { defaultValue: 'Automation Rules' })}</span>
            </button>
            <button
              onClick={() => setActiveTab('executions')}
              className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 ${
                activeTab === 'executions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{t('workflows.tabs.executions', { defaultValue: 'Executions' })}</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'templates' && <WorkflowTemplates />}
          {activeTab === 'builder' && <WorkflowBuilder />}
          {activeTab === 'rules' && <AutomationRulesList />}
          {activeTab === 'executions' && <WorkflowExecutions />}
        </div>
      </div>
    </div>
  );
}
