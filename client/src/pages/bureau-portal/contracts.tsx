/**
 * Bureau Portal - Contracts
 *
 * Bureau-specific view of contracts and Master Service Agreements (MSAs).
 * Shows active contracts with companies and associated rate cards.
 *
 * Features:
 * - Active MSAs with companies
 * - Rate card details
 * - Contract terms and conditions
 * - Performance against contract KPIs
 * - Contract renewal tracking
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withVMSErrorBoundary } from '@/components/vms/VMSErrorBoundary';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';

interface Contract {
  id: string;
  contractNumber: string;
  companyId: string;
  companyName: string;
  contractType: 'MSA' | 'RATE_CARD' | 'INDIVIDUAL';
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  startDate: string;
  endDate?: string;
  autoRenewal: boolean;
  terminationNoticeDays: number;

  // Rate Information
  placementFeePercentage?: number;
  hourlyMarkupPercentage?: number;
  fixedPlacementFee?: number;
  paymentTermsDays: number;
  guaranteePeriodDays: number;

  // Performance
  totalPlacements: number;
  totalEarnings: number;
  averageTimeToFill: number;
}

interface RateCard {
  id: string;
  contractId: string;
  roleCategory: string;
  seniorityLevel: string;
  placementFeePercentage?: number;
  hourlyMarkupPercentage?: number;
  fixedFee?: number;
  minimumSalary?: number;
  maximumSalary?: number;
}

function BureauPortalContracts() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rateCards, setRateCards] = useState<Record<string, RateCard[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (user && user.userType !== 'BUREAU') {
      toast({
        title: 'Access Denied',
        description: 'This page is only accessible to bureaus',
        variant: 'destructive',
      });
      setLocation('/dashboard');
      return;
    }

    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: Contract[] }>('/api/vms/bureaus/contracts');
      setContracts(data.data || []);

      // Fetch rate cards for each contract
      const rateCardPromises = data.data.map(async (contract: Contract) => {
        try {
          const rateData = await apiGet<{ data: RateCard[] }>(`/api/vms/contracts/${contract.id}/rate-cards`);
          return { contractId: contract.id, rateCards: rateData.data || [] };
        } catch (error) {
          return { contractId: contract.id, rateCards: [] };
        }
      });

      const rateCardResults = await Promise.all(rateCardPromises);
      const rateCardsMap: Record<string, RateCard[]> = {};
      rateCardResults.forEach((result) => {
        rateCardsMap[result.contractId] = result.rateCards;
      });
      setRateCards(rateCardsMap);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load contracts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_SIGNATURE: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-orange-100 text-orange-800',
    TERMINATED: 'bg-red-100 text-red-800',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING_SIGNATURE':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const isExpiringSoon = (contract: Contract) => {
    if (!contract.endDate) {return false;}
    const daysUntilExpiry = Math.floor(
      (new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 60;
  };

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
  const pendingContracts = contracts.filter((c) => c.status === 'PENDING_SIGNATURE');
  const expiredContracts = contracts.filter((c) => c.status === 'EXPIRED' || c.status === 'TERMINATED');

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to view contracts</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bureau-portal">Bureau Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.myContracts')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.myContracts')}</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your contracts with client companies
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                  <p className="text-3xl font-bold mt-2">{activeContracts.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Signature</p>
                  <p className="text-3xl font-bold mt-2">{pendingContracts.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold mt-2">
                    €{activeContracts.reduce((sum, c) => sum + c.totalEarnings, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contracts Found</h3>
              <p className="text-gray-500 text-center">
                You don't have any contracts yet. Contact your account manager to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeContracts.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingContracts.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({expiredContracts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {contract.companyName}
                          {isExpiringSoon(contract) && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                              Expiring Soon
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Contract #{contract.contractNumber} • {contract.contractType}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[contract.status]}>
                        {getStatusIcon(contract.status)}
                        <span className="ml-1">{contract.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Contract Details */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Contract Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-medium">
                              {new Date(contract.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          {contract.endDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">End Date:</span>
                              <span className="font-medium">
                                {new Date(contract.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Payment Terms:</span>
                            <span className="font-medium">Net {contract.paymentTermsDays} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Guarantee Period:</span>
                            <span className="font-medium">{contract.guaranteePeriodDays} days</span>
                          </div>
                        </div>
                      </div>

                      {/* Rate Information */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Rate Structure</h4>
                        <div className="space-y-2 text-sm">
                          {contract.placementFeePercentage && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Placement Fee:</span>
                              <span className="font-medium">{contract.placementFeePercentage}%</span>
                            </div>
                          )}
                          {contract.hourlyMarkupPercentage && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Hourly Markup:</span>
                              <span className="font-medium">{contract.hourlyMarkupPercentage}%</span>
                            </div>
                          )}
                          {contract.fixedPlacementFee && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Fixed Fee:</span>
                              <span className="font-medium">
                                €{contract.fixedPlacementFee.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {rateCards[contract.id] && rateCards[contract.id].length > 0 && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Rate Cards:</span>
                              <span className="font-medium">{rateCards[contract.id].length} defined</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Placements</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {contract.totalPlacements}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-600">
                          €{contract.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg. Time to Fill</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {contract.averageTimeToFill.toFixed(1)} days
                        </p>
                      </div>
                    </div>

                    {/* Rate Cards Table */}
                    {rateCards[contract.id] && rateCards[contract.id].length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-sm mb-3">Rate Cards</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left font-medium">Role Category</th>
                                <th className="px-4 py-2 text-left font-medium">Seniority</th>
                                <th className="px-4 py-2 text-right font-medium">Fee</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {rateCards[contract.id].slice(0, 5).map((rateCard) => (
                                <tr key={rateCard.id}>
                                  <td className="px-4 py-2">{rateCard.roleCategory}</td>
                                  <td className="px-4 py-2">{rateCard.seniorityLevel}</td>
                                  <td className="px-4 py-2 text-right">
                                    {rateCard.placementFeePercentage && `${rateCard.placementFeePercentage}%`}
                                    {rateCard.hourlyMarkupPercentage && `${rateCard.hourlyMarkupPercentage}% markup`}
                                    {rateCard.fixedFee && `€${rateCard.fixedFee.toLocaleString()}`}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {rateCards[contract.id].length > 5 && (
                            <div className="px-4 py-2 bg-gray-50 text-sm text-center text-gray-600">
                              +{rateCards[contract.id].length - 5} more rate cards
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/contracts/${contract.id}`)}
                      >
                        View Full Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {activeContracts.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No active contracts</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingContracts.map((contract) => (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {contract.companyName}
                        </CardTitle>
                        <CardDescription>Contract #{contract.contractNumber}</CardDescription>
                      </div>
                      <Badge className={statusColors[contract.status]}>
                        {getStatusIcon(contract.status)}
                        <span className="ml-1">{contract.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      This contract is awaiting signature. Please review and sign to activate.
                    </p>
                    <Button onClick={() => setLocation(`/contracts/${contract.id}`)}>
                      Review & Sign
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {pendingContracts.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No pending contracts</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              {expiredContracts.map((contract) => (
                <Card key={contract.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {contract.companyName}
                        </CardTitle>
                        <CardDescription>Contract #{contract.contractNumber}</CardDescription>
                      </div>
                      <Badge className={statusColors[contract.status]}>
                        {contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {contract.endDate && `Ended on ${new Date(contract.endDate).toLocaleDateString()}`}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {expiredContracts.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No expired contracts</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(
  BureauPortalContracts,
  'Failed to load contracts. Please try again.'
);
