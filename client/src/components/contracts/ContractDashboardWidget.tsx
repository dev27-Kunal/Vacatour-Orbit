/**
 * Contract Dashboard Widget
 * Shows contract overview on the main dashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  FileSignature,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Euro,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { apiGet, ApiError } from '@/lib/api-client';

interface ContractStats {
  total: number;
  active: number;
  pending_signature: number;
  draft: number;
  this_month: number;
  completion_rate: number;
}

interface RecentContract {
  id: string;
  contract_number: string;
  status: string;
  candidate_name: string;
  created_at: string;
  signatures_received: number;
  signatures_required: number;
}

interface ContractDashboardWidgetProps {
  userType: string;
  userId: string;
}

export function ContractDashboardWidget({ userType, userId }: ContractDashboardWidgetProps) {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchContractData();
  }, []);

  const fetchContractData = async () => {
    try {
      setLoading(true);

      // Fetch contract statistics
      const statsResponse = await apiGet('/api/v2/contracts/stats');
      setStats(statsResponse.data);

      // Fetch recent contracts
      const contractsResponse = await apiGet('/api/v2/contracts?limit=5');
      setRecentContracts(contractsResponse.data || []);
    } catch (error) {
      console.error('Error fetching contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      DRAFT: { label: 'Concept', variant: 'secondary', icon: Clock },
      PENDING_SIGNATURE: { label: 'Te Tekenen', variant: 'warning', icon: FileSignature },
      PARTIALLY_SIGNED: { label: 'Deels Getekend', variant: 'warning', icon: FileSignature },
      FULLY_SIGNED: { label: 'Getekend', variant: 'success', icon: CheckCircle },
      ACTIVE: { label: 'Actief', variant: 'success', icon: CheckCircle },
    };

    const config = statusConfig[status] || { label: status, variant: 'default', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contracten Overzicht
            </CardTitle>
            <CardDescription>
              Beheer al uw contracten en handtekeningen
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/contracts')}
          >
            Alle contracten
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Totaal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Actief</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending_signature}
              </div>
              <div className="text-xs text-muted-foreground">Te Tekenen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.this_month}</div>
              <div className="text-xs text-muted-foreground">Deze Maand</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && stats.completion_rate > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Voltooiingspercentage</span>
              <span className="text-sm text-muted-foreground">
                {stats.completion_rate}%
              </span>
            </div>
            <Progress value={stats.completion_rate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Van alle contracten deze maand volledig ondertekend
            </p>
          </div>
        )}

        <Separator />

        {/* Action Required Alert */}
        {stats && stats.pending_signature > 0 && (
          <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Actie Vereist
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  U heeft {stats.pending_signature} contract(en) die wachten op ondertekening.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-orange-700 p-0 h-auto mt-2"
                  onClick={() => setLocation('/contracts?filter=pending_signature')}
                >
                  Bekijk te ondertekenen contracten →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Contracts */}
        <div>
          <h3 className="font-medium mb-3">Recente Contracten</h3>
          {recentContracts.length > 0 ? (
            <div className="space-y-2">
              {recentContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => setLocation(`/contracts/${contract.id}`)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {contract.contract_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contract.candidate_name} •{' '}
                        {format(new Date(contract.created_at), 'dd MMM', {
                          locale: nl,
                        })}
                      </p>
                    </div>
                    {getStatusBadge(contract.status)}
                    {contract.status === 'PENDING_SIGNATURE' && (
                      <div className="text-xs text-muted-foreground">
                        {contract.signatures_received}/{contract.signatures_required}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Geen recente contracten</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setLocation('/contracts/new')}
              >
                Maak eerste contract
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {userType === 'BEDRIJF' && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/contracts/new')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Nieuw Contract
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/contracts/templates')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}