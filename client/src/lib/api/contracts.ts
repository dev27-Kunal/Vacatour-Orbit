import { apiRequest } from '@/lib/api';

// Contract API types
export interface Contract {
  id: string;
  bureau_id: string;
  bureau_name: string;
  contract_number: string;
  type: 'MSA' | 'SOW' | 'RATE_CARD' | 'NDA' | 'SLA';
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  renewal_type: 'AUTO' | 'MANUAL' | 'NONE';
  compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
  signed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  is_standard: boolean;
  sections: any[];
  tags: string[];
  created_at: string;
}

export interface RateCard {
  id: string;
  bureau_id: string;
  category: string;
  role: string;
  seniority: string;
  min_rate: number;
  max_rate: number;
  standard_rate: number;
  currency: string;
  unit: 'HOUR' | 'DAY' | 'MONTH';
  effective_date: string;
  expiry_date: string | null;
}

// Contract API endpoints
export const contractApi = {
  // Contracts
  async getContracts(params?: {
    status?: string;
    bureauId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest<Contract[]>(`/api/vms/contracts${queryParams ? `?${queryParams}` : ''}`);
  },

  async getContract(id: string) {
    return apiRequest<Contract>(`/api/vms/contracts/${id}`);
  },

  async createContract(contract: Partial<Contract>) {
    return apiRequest<Contract>('/api/vms/contracts', {
      method: 'POST',
      body: JSON.stringify(contract)
    });
  },

  async updateContract(id: string, updates: Partial<Contract>) {
    return apiRequest<Contract>(`/api/vms/contracts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteContract(id: string) {
    return apiRequest(`/api/vms/contracts/${id}`, {
      method: 'DELETE'
    });
  },

  async signContract(id: string, signatureData: {
    signedBy: string;
    signatureImage?: string;
    ipAddress: string;
  }) {
    return apiRequest(`/api/vms/contracts/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(signatureData)
    });
  },

  async terminateContract(id: string, reason: string) {
    return apiRequest(`/api/vms/contracts/${id}/terminate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async renewContract(id: string, renewalData: {
    newEndDate: string;
    newValue?: number;
    notes?: string;
  }) {
    return apiRequest<Contract>(`/api/vms/contracts/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(renewalData)
    });
  },

  // Templates
  async getTemplates() {
    return apiRequest<ContractTemplate[]>('/api/vms/contract-templates');
  },

  async getTemplate(id: string) {
    return apiRequest<ContractTemplate>(`/api/vms/contract-templates/${id}`);
  },

  async createTemplate(template: Partial<ContractTemplate>) {
    return apiRequest<ContractTemplate>('/api/vms/contract-templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  },

  async updateTemplate(id: string, updates: Partial<ContractTemplate>) {
    return apiRequest<ContractTemplate>(`/api/vms/contract-templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteTemplate(id: string) {
    return apiRequest(`/api/vms/contract-templates/${id}`, {
      method: 'DELETE'
    });
  },

  async duplicateTemplate(templateId: string) {
    // Backend supports clone via POST /:id/clone
    return apiRequest<ContractTemplate>(`/api/vms/contract-templates/${templateId}/clone`, { method: 'POST' });
  },

  // Rate Cards
  async getRateCards(params?: {
    bureauId?: string;
    category?: string;
    active?: boolean;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest<RateCard[]>(`/api/vms/contracts/rates${queryParams ? `?${queryParams}` : ''}`);
  },

  async getRateCard(id: string) {
    return apiRequest<RateCard>(`/api/vms/contracts/rates/${id}`);
  },

  async createRateCard(rateCard: Partial<RateCard>) {
    return apiRequest<RateCard>('/api/vms/contracts/rates', {
      method: 'POST',
      body: JSON.stringify(rateCard)
    });
  },

  async updateRateCard(id: string, updates: Partial<RateCard>) {
    return apiRequest<RateCard>(`/api/vms/contracts/rates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteRateCard(id: string) {
    return apiRequest(`/api/vms/contracts/rates/${id}`, {
      method: 'DELETE'
    });
  },

  // Documents
  async uploadDocument(contractId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/vms/contracts/${contractId}/documents`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Document upload failed');
    }

    return response.json();
  },

  async downloadDocument(contractId: string, documentId: string) {
    const response = await fetch(`/api/vms/contracts/${contractId}/documents/${documentId}`);

    if (!response.ok) {
      throw new Error('Document download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${documentId}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  async deleteDocument(contractId: string, documentId: string) {
    return apiRequest(`/api/vms/contracts/${contractId}/documents/${documentId}`, {
      method: 'DELETE'
    });
  },

  // Stats and Reports
  async getContractStats() {
    return apiRequest('/api/vms/contracts/stats');
  },

  async getExpiringContracts(days: number = 30) {
    return apiRequest<Contract[]>(`/api/vms/contracts/expiring?days=${days}`);
  },

  async getComplianceReport(bureauId?: string) {
    const url = bureauId
      ? `/api/vms/contracts/compliance?bureauId=${bureauId}`
      : '/api/vms/contracts/compliance';
    return apiRequest(url);
  },

  async exportContracts(format: 'csv' | 'pdf' | 'excel', filters?: any) {
    const response = await fetch('/api/vms/contracts/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ format, filters })
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contracts-${Date.now()}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// Contract utility functions
export const contractUtils = {
  // Calculate days until expiry
  getDaysUntilExpiry(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  },

  // Get status color
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      ACTIVE: 'bg-green-100 text-green-700',
      EXPIRED: 'bg-red-100 text-red-700',
      TERMINATED: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  },

  // Get compliance color
  getComplianceColor(status: string): string {
    const colors: Record<string, string> = {
      COMPLIANT: 'text-green-600',
      NON_COMPLIANT: 'text-red-600',
      PENDING_REVIEW: 'text-yellow-600'
    };
    return colors[status] || 'text-gray-600';
  },

  // Format contract type
  formatContractType(type: string): string {
    const types: Record<string, string> = {
      MSA: 'Master Service Agreement',
      SOW: 'Statement of Work',
      RATE_CARD: 'Rate Card',
      NDA: 'Non-Disclosure Agreement',
      SLA: 'Service Level Agreement'
    };
    return types[type] || type;
  },

  // Check if contract needs renewal
  needsRenewal(contract: Contract): boolean {
    const daysUntilExpiry = this.getDaysUntilExpiry(contract.end_date);
    return contract.status === 'ACTIVE' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  },

  // Check if contract is expiring soon
  isExpiringSoon(contract: Contract, days: number = 30): boolean {
    const daysUntilExpiry = this.getDaysUntilExpiry(contract.end_date);
    return daysUntilExpiry > 0 && daysUntilExpiry <= days;
  },

  // Validate contract dates
  validateDates(startDate: string, endDate: string): { valid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return { valid: false, error: 'End date must be after start date' };
    }

    if (start < new Date().setHours(0, 0, 0, 0)) {
      return { valid: false, error: 'Start date cannot be in the past' };
    }

    return { valid: true };
  }
};
