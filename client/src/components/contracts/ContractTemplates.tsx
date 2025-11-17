import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Copy, Trash2, Edit, Download,
  CheckCircle, Clock, Shield, Zap, Star, ChevronRight
} from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: 'MSA' | 'SOW' | 'RATE_CARD' | 'NDA' | 'SLA';
  category: string;
  is_standard: boolean;
  usage_count: number;
  last_used: string | null;
  created_at: string;
  sections: Array<{
    title: string;
    required: boolean;
    editable: boolean;
  }>;
  tags: string[];
}

export default function ContractTemplates() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vms/contracts/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      // Mock data for demo
      setTemplates([
        {
          id: '1',
          name: 'Standard Master Service Agreement',
          description: 'Comprehensive MSA template with standard terms for bureau partnerships',
          type: 'MSA',
          category: 'STANDARD',
          is_standard: true,
          usage_count: 234,
          last_used: '2025-01-26',
          created_at: '2024-01-01',
          sections: [
            { title: 'Parties & Definitions', required: true, editable: true },
            { title: 'Scope of Services', required: true, editable: true },
            { title: 'Payment Terms', required: true, editable: true },
            { title: 'Confidentiality', required: true, editable: false },
            { title: 'Intellectual Property', required: true, editable: false },
            { title: 'Termination', required: true, editable: true }
          ],
          tags: ['standard', 'bureau', 'comprehensive']
        },
        {
          id: '2',
          name: 'IT Services Rate Card',
          description: 'Rate card template for IT staffing services with role-based pricing',
          type: 'RATE_CARD',
          category: 'TECHNOLOGY',
          is_standard: false,
          usage_count: 156,
          last_used: '2025-01-25',
          created_at: '2024-03-15',
          sections: [
            { title: 'Developer Rates', required: true, editable: true },
            { title: 'Architecture Rates', required: true, editable: true },
            { title: 'Project Management', required: true, editable: true },
            { title: 'Volume Discounts', required: false, editable: true }
          ],
          tags: ['IT', 'technology', 'rates']
        },
        {
          id: '3',
          name: 'Quick Start NDA',
          description: 'Simple non-disclosure agreement for initial bureau discussions',
          type: 'NDA',
          category: 'LEGAL',
          is_standard: true,
          usage_count: 89,
          last_used: '2025-01-24',
          created_at: '2024-02-01',
          sections: [
            { title: 'Definition of Confidential Information', required: true, editable: false },
            { title: 'Obligations', required: true, editable: false },
            { title: 'Duration', required: true, editable: true },
            { title: 'Exceptions', required: true, editable: false }
          ],
          tags: ['legal', 'confidentiality', 'quick']
        },
        {
          id: '4',
          name: 'Performance-Based SOW',
          description: 'Statement of work with performance metrics and bonus structure',
          type: 'SOW',
          category: 'PERFORMANCE',
          is_standard: false,
          usage_count: 67,
          last_used: '2025-01-20',
          created_at: '2024-06-01',
          sections: [
            { title: 'Project Description', required: true, editable: true },
            { title: 'Deliverables', required: true, editable: true },
            { title: 'Performance Metrics', required: true, editable: true },
            { title: 'Bonus Structure', required: false, editable: true },
            { title: 'Timeline', required: true, editable: true }
          ],
          tags: ['performance', 'bonus', 'project']
        },
        {
          id: '5',
          name: 'Enterprise SLA Template',
          description: 'Service level agreement for enterprise-level bureau partnerships',
          type: 'SLA',
          category: 'ENTERPRISE',
          is_standard: true,
          usage_count: 45,
          last_used: '2025-01-18',
          created_at: '2024-04-15',
          sections: [
            { title: 'Service Definitions', required: true, editable: true },
            { title: 'Response Times', required: true, editable: true },
            { title: 'Fill Rate Targets', required: true, editable: true },
            { title: 'Quality Metrics', required: true, editable: true },
            { title: 'Penalties & Credits', required: true, editable: true },
            { title: 'Reporting Requirements', required: true, editable: true }
          ],
          tags: ['enterprise', 'SLA', 'metrics']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const duplicateTemplate = async (template: ContractTemplate) => {
    try {
      await fetch('/api/vms/contracts/templates/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id })
      });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    try {
      await fetch(`/api/vms/contracts/templates/${id}`, {
        method: 'DELETE'
      });
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const categories = ['ALL', 'STANDARD', 'TECHNOLOGY', 'LEGAL', 'PERFORMANCE', 'ENTERPRISE'];

  const typeColors = {
    MSA: 'bg-blue-100 text-blue-700',
    SOW: 'bg-green-100 text-green-700',
    RATE_CARD: 'bg-purple-100 text-purple-700',
    NDA: 'bg-yellow-100 text-yellow-700',
    SLA: 'bg-red-100 text-red-700'
  };

  const filteredTemplates = templates
    .filter(t => selectedCategory === 'ALL' || t.category === selectedCategory)
    .filter(t =>
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Contract Templates</h3>
          <p className="text-sm text-gray-600 mt-1">Pre-approved templates for quick contract creation</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'ALL' ? 'All Templates' : category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${typeColors[template.type]}`}>
                    {template.type}
                  </span>
                  {template.is_standard && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Standard
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            </div>

            {/* Sections */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Sections</p>
              <div className="space-y-1">
                {template.sections.slice(0, 3).map((section, idx) => (
                  <div key={idx} className="flex items-center text-xs text-gray-600">
                    <ChevronRight className="h-3 w-3 mr-1" />
                    <span>{section.title}</span>
                    {section.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </div>
                ))}
                {template.sections.length > 3 && (
                  <p className="text-xs text-gray-500 italic">
                    +{template.sections.length - 3} more sections
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Used {template.usage_count} times</span>
              {template.last_used && (
                <span>Last: {new Date(template.last_used).toLocaleDateString()}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <button className="text-gray-500 hover:text-primary flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Use</span>
              </button>
              <button
                onClick={() => duplicateTemplate(template)}
                className="text-gray-500 hover:text-primary flex items-center space-x-1"
              >
                <Copy className="h-4 w-4" />
                <span className="text-sm">Copy</span>
              </button>
              <button className="text-gray-500 hover:text-primary flex items-center space-x-1">
                <Edit className="h-4 w-4" />
                <span className="text-sm">Edit</span>
              </button>
              {!template.is_standard && (
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="text-gray-500 hover:text-red-500 flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">No templates found</p>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Create Your First Template
          </button>
        </div>
      )}
    </div>
  );
}