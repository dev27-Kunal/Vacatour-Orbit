import React, { useState, useEffect } from 'react';
import {
  X, FileText, Calendar, DollarSign, Users, CheckCircle,
  Clock, AlertCircle, Download, Edit, Send, Eye, Shield,
  TrendingUp, Activity, Award, ChevronRight
} from 'lucide-react';
import { apiGet, ApiError } from '@/lib/api-client';

interface ContractDetailsProps {
  contractId: string;
  onClose: () => void;
}

interface ContractDetail {
  id: string;
  bureau_name: string;
  contract_number: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  value: number;
  currency: string;
  terms: {
    payment_terms: string;
    notice_period: string;
    renewal_type: string;
    sla_response_time: string;
    sla_fill_rate: number;
    penalty_clause: boolean;
  };
  performance: {
    current_fill_rate: number;
    avg_time_to_fill: number;
    quality_score: number;
    compliance_rate: number;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploaded_at: string;
    size: number;
  }>;
  history: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }>;
}

export default function ContractDetails({ contractId, onClose }: ContractDetailsProps) {
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'terms' | 'performance' | 'documents' | 'history'>('overview');

  useEffect(() => {
    fetchContractDetails();
  }, [contractId]);

  const fetchContractDetails = async () => {
    setLoading(true);
    try {
      const response = await apiGet(`/api/vms/contracts/${contractId}`);
      setContract(response.data);
    } catch (error) {
      // Mock data for demo
      setContract({
        id: contractId,
        bureau_name: 'TechRecruit Solutions',
        contract_number: 'MSA-2025-001',
        type: 'MSA',
        status: 'ACTIVE',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        value: 250000,
        currency: 'EUR',
        terms: {
          payment_terms: 'Net 30',
          notice_period: '90 days',
          renewal_type: 'AUTO',
          sla_response_time: '24 hours',
          sla_fill_rate: 85,
          penalty_clause: true
        },
        performance: {
          current_fill_rate: 92,
          avg_time_to_fill: 12,
          quality_score: 88,
          compliance_rate: 96
        },
        documents: [
          {
            id: '1',
            name: 'Master Service Agreement.pdf',
            type: 'CONTRACT',
            uploaded_at: '2024-12-20',
            size: 245000
          },
          {
            id: '2',
            name: 'Rate Card 2025.xlsx',
            type: 'RATE_CARD',
            uploaded_at: '2024-12-20',
            size: 45000
          },
          {
            id: '3',
            name: 'Insurance Certificate.pdf',
            type: 'COMPLIANCE',
            uploaded_at: '2025-01-05',
            size: 180000
          }
        ],
        history: [
          {
            id: '1',
            action: 'CONTRACT_SIGNED',
            user: 'John Doe',
            timestamp: '2024-12-20T10:30:00Z',
            details: 'Contract signed by both parties'
          },
          {
            id: '2',
            action: 'DOCUMENT_UPLOADED',
            user: 'Jane Smith',
            timestamp: '2025-01-05T14:15:00Z',
            details: 'Insurance certificate uploaded'
          },
          {
            id: '3',
            action: 'RATE_UPDATED',
            user: 'Admin User',
            timestamp: '2025-01-15T09:00:00Z',
            details: 'Senior Developer rate updated to €95/hr'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {return bytes + ' B';}
    if (bytes < 1024 * 1024) {return (bytes / 1024).toFixed(1) + ' KB';}
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!contract) {return null;}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{contract.contract_number}</h2>
              <p className="text-sm text-gray-600 mt-1">{contract.bureau_name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex px-6">
            {['overview', 'terms', 'performance', 'documents', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Information */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="text-sm">Type</span>
                      </div>
                      <p className="text-lg font-semibold">{contract.type}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <DollarSign className="h-5 w-5 mr-2" />
                        <span className="text-sm">Total Value</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatCurrency(contract.value, contract.currency)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-5 w-5 mr-2" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">Status</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">{contract.status}</p>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Fill Rate</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{contract.performance.current_fill_rate}%</p>
                        <p className="text-xs text-gray-500">Target: {contract.terms.sla_fill_rate}%</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Avg Time to Fill</span>
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">{contract.performance.avg_time_to_fill} days</p>
                        <p className="text-xs text-gray-500">Industry avg: 18 days</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Quality Score</span>
                          <Award className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold">{contract.performance.quality_score}%</p>
                        <p className="text-xs text-gray-500">Based on placements</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Compliance</span>
                          <Shield className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{contract.performance.compliance_rate}%</p>
                        <p className="text-xs text-gray-500">All requirements met</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Tab */}
              {activeTab === 'terms' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Commercial Terms</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Payment Terms</span>
                          <span className="font-medium">{contract.terms.payment_terms}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Notice Period</span>
                          <span className="font-medium">{contract.terms.notice_period}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Renewal Type</span>
                          <span className="font-medium">{contract.terms.renewal_type}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Penalty Clause</span>
                          <span className="font-medium">{contract.terms.penalty_clause ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Service Level Agreement</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Response Time</span>
                          <span className="font-medium">{contract.terms.sla_response_time}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Minimum Fill Rate</span>
                          <span className="font-medium">{contract.terms.sla_fill_rate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Performance Summary</p>
                        <p className="text-xs text-blue-700 mt-1">
                          This bureau is exceeding all SLA targets with a {contract.performance.current_fill_rate}% fill rate
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Monthly Trends</h4>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Performance chart would go here</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Category Performance</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Software Development</span>
                            <span>95%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 rounded-full h-2" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Data Science</span>
                            <span>88%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 rounded-full h-2" style={{ width: '88%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Product Management</span>
                            <span>92%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 rounded-full h-2" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Contract Documents</h3>
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                      Upload Document
                    </button>
                  </div>
                  <div className="space-y-3">
                    {contract.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.type} • {formatFileSize(doc.size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Activity History</h3>
                  <div className="space-y-3">
                    {contract.history.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {item.action === 'CONTRACT_SIGNED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {item.action === 'DOCUMENT_UPLOADED' && <FileText className="h-5 w-5 text-blue-500" />}
                          {item.action === 'RATE_UPDATED' && <DollarSign className="h-5 w-5 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{item.details}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">by {item.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}