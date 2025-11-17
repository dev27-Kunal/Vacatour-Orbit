import { apiRequest } from '@/lib/api';

// Workflow API types
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  started_at: string;
  completed_at: string | null;
  trigger_data: any;
  steps: any[];
  error?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  priority: number;
}

// Workflow API endpoints
export const workflowApi = {
  // Templates
  async getTemplates() {
    return apiRequest<WorkflowTemplate[]>('/api/vms/workflows/templates');
  },

  async getTemplate(id: string) {
    return apiRequest<WorkflowTemplate>(`/api/vms/workflows/templates/${id}`);
  },

  async createTemplate(template: Partial<WorkflowTemplate>) {
    return apiRequest<WorkflowTemplate>('/api/vms/workflows/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  },

  async updateTemplate(id: string, updates: Partial<WorkflowTemplate>) {
    return apiRequest<WorkflowTemplate>(`/api/vms/workflows/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteTemplate(id: string) {
    return apiRequest(`/api/vms/workflows/templates/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleTemplate(id: string, isActive: boolean) {
    return apiRequest(`/api/vms/workflows/templates/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_active: isActive })
    });
  },

  async duplicateTemplate(id: string) {
    return apiRequest<WorkflowTemplate>(`/api/vms/workflows/templates/${id}/duplicate`, {
      method: 'POST'
    });
  },

  // Executions
  async getExecutions(params?: {
    status?: string;
    workflowId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest<WorkflowExecution[]>(`/api/vms/workflows/executions${queryParams ? `?${queryParams}` : ''}`);
  },

  async getExecution(id: string) {
    return apiRequest<WorkflowExecution>(`/api/vms/workflows/executions/${id}`);
  },

  async retryExecution(id: string) {
    return apiRequest<WorkflowExecution>(`/api/vms/workflows/executions/${id}/retry`, {
      method: 'POST'
    });
  },

  async cancelExecution(id: string) {
    return apiRequest(`/api/vms/workflows/executions/${id}/cancel`, {
      method: 'POST'
    });
  },

  // Automation Rules
  async getAutomationRules() {
    return apiRequest<AutomationRule[]>('/api/vms/workflows/automation-rules');
  },

  async getAutomationRule(id: string) {
    return apiRequest<AutomationRule>(`/api/vms/workflows/automation-rules/${id}`);
  },

  async createAutomationRule(rule: Partial<AutomationRule>) {
    return apiRequest<AutomationRule>('/api/vms/workflows/automation-rules', {
      method: 'POST',
      body: JSON.stringify(rule)
    });
  },

  async updateAutomationRule(id: string, updates: Partial<AutomationRule>) {
    return apiRequest<AutomationRule>(`/api/vms/workflows/automation-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteAutomationRule(id: string) {
    return apiRequest(`/api/vms/workflows/automation-rules/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleAutomationRule(id: string, isActive: boolean) {
    return apiRequest(`/api/vms/workflows/automation-rules/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_active: isActive })
    });
  },

  // Workflow Builder
  async validateWorkflow(workflow: any) {
    return apiRequest('/api/vms/workflows/validate', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  },

  async testWorkflow(workflow: any, testData: any) {
    return apiRequest('/api/vms/workflows/test', {
      method: 'POST',
      body: JSON.stringify({ workflow, testData })
    });
  },

  async deployWorkflow(workflow: any) {
    return apiRequest('/api/vms/workflows/deploy', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  },

  // Stats and Monitoring
  async getWorkflowStats() {
    return apiRequest('/api/vms/workflows/stats');
  },

  async getExecutionLogs(executionId: string) {
    return apiRequest(`/api/vms/workflows/executions/${executionId}/logs`);
  },

  async getWorkflowMetrics(workflowId: string, period: string) {
    return apiRequest(`/api/vms/workflows/${workflowId}/metrics?period=${period}`);
  }
};

// Workflow utility functions
export const workflowUtils = {
  // Get status color
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      SUCCESS: 'text-green-600 bg-green-100',
      FAILED: 'text-red-600 bg-red-100',
      RUNNING: 'text-blue-600 bg-blue-100',
      PENDING: 'text-gray-600 bg-gray-100',
      SKIPPED: 'text-gray-400 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  },

  // Calculate duration
  calculateDuration(startedAt: string, completedAt: string | null): string {
    if (!completedAt) {return 'Running...';}

    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const seconds = Math.floor((end - start) / 1000);

    if (seconds < 60) {return `${seconds}s`;}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;}
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  },

  // Format trigger type
  formatTriggerType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  },

  // Validate workflow structure
  validateWorkflowStructure(workflow: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflow.name) {errors.push('Workflow name is required');}
    if (!workflow.trigger_type) {errors.push('Trigger type is required');}
    if (!workflow.actions || workflow.actions.length === 0) {
      errors.push('At least one action is required');
    }

    // Validate connections
    if (workflow.edges) {
      const nodeIds = new Set(workflow.nodes?.map((n: any) => n.id));
      workflow.edges.forEach((edge: any) => {
        if (!nodeIds.has(edge.source)) {
          errors.push(`Invalid edge source: ${edge.source}`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`Invalid edge target: ${edge.target}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};