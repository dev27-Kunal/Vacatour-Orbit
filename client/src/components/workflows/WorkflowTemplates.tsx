import React, { useState, useEffect } from 'react';
import {
  Play, Settings, Copy, Trash2, Edit, ToggleLeft, ToggleRight,
  Users, Mail, Clock, Filter, Zap, FileText
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api-client';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  is_active: boolean;
  created_at: string;
  execution_count: number;
  success_rate: number;
  tags: string[];
}

const categoryIcons: { [key: string]: any } = {
  'BUREAU_SELECTION': Users,
  'CANDIDATE_SCREENING': Filter,
  'COMMUNICATION': Mail,
  'REMINDER': Clock,
  'JOB_DISTRIBUTION': Zap
};

const categoryColors: { [key: string]: string } = {
  'BUREAU_SELECTION': 'bg-blue-100 text-blue-700',
  'CANDIDATE_SCREENING': 'bg-green-100 text-green-700',
  'COMMUNICATION': 'bg-purple-100 text-purple-700',
  'REMINDER': 'bg-yellow-100 text-yellow-700',
  'JOB_DISTRIBUTION': 'bg-indigo-100 text-indigo-700'
};

export default function WorkflowTemplates() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/vms/workflows/templates');
      setTemplates(response.data || []);
    } catch (error) {
      // Mock data for demo
      setTemplates([
        {
          id: '1',
          name: 'Auto Bureau Selection',
          description: 'Automatically select and notify best-matched bureaus when a new job is created',
          category: 'BUREAU_SELECTION',
          trigger_type: 'JOB_CREATED',
          is_active: true,
          created_at: '2025-01-15',
          execution_count: 234,
          success_rate: 96,
          tags: ['automation', 'bureaus', 'matching']
        },
        {
          id: '2',
          name: 'Candidate Auto-Screening',
          description: 'Automatically screen candidates against minimum requirements and reject unqualified',
          category: 'CANDIDATE_SCREENING',
          trigger_type: 'APPLICATION_RECEIVED',
          is_active: true,
          created_at: '2025-01-10',
          execution_count: 567,
          success_rate: 89,
          tags: ['screening', 'candidates', 'requirements']
        },
        {
          id: '3',
          name: 'Bureau Non-Response Reminder',
          description: 'Send reminders to bureaus that haven\'t submitted candidates within 48 hours',
          category: 'REMINDER',
          trigger_type: 'SCHEDULED',
          is_active: false,
          created_at: '2025-01-05',
          execution_count: 45,
          success_rate: 100,
          tags: ['reminder', 'bureaus', 'follow-up']
        },
        {
          id: '4',
          name: 'Weekly Performance Report',
          description: 'Generate and send weekly performance reports to all active bureaus',
          category: 'COMMUNICATION',
          trigger_type: 'SCHEDULED',
          is_active: true,
          created_at: '2025-01-01',
          execution_count: 12,
          success_rate: 100,
          tags: ['report', 'performance', 'weekly']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, currentStatus: boolean) => {
    try {
      await apiPost(`/api/vms/workflows/templates/${id}/toggle`, { is_active: !currentStatus });

      setTemplates(templates.map(t =>
        t.id === id ? { ...t, is_active: !currentStatus } : t
      ));
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const duplicateWorkflow = async (template: WorkflowTemplate) => {
    const newTemplate = {
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`,
      execution_count: 0
    };

    try {
      await apiPost('/api/vms/workflows/templates', newTemplate);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
    }
  };

  const filteredTemplates = selectedCategory === 'ALL'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              selectedCategory === 'ALL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Templates
          </button>
          {Object.keys(categoryColors).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = categoryIcons[template.category] || FileText;

          return (
            <div key={template.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className="text-xs text-gray-500">{template.trigger_type}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleWorkflow(template.id, template.is_active)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {template.is_active ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{template.execution_count} executions</span>
                <span>{template.success_rate}% success</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <button className="text-gray-500 hover:text-primary flex items-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => duplicateWorkflow(template)}
                  className="text-gray-500 hover:text-primary flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">Duplicate</span>
                </button>
                <button className="text-gray-500 hover:text-red-500 flex items-center space-x-1">
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">No workflow templates found</p>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Create Your First Workflow
          </button>
        </div>
      )}
    </div>
  );
}