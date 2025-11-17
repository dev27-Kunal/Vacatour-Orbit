/**
 * Contract List Component
 * Displays all contracts with filtering and actions
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  FileSignature,
} from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';

interface Contract {
  id: string;
  contract_number: string;
  contract_type: 'VAST' | 'INTERIM' | 'UITZENDEN';
  status: string;
  company_name?: string;
  bureau_name?: string;
  candidate_name?: string;
  job_title?: string;
  start_date: string;
  end_date?: string;
  salary_amount?: number;
  hourly_rate?: number;
  bureau_fee_amount?: number;
  signatures_required: number;
  signatures_received: number;
  created_at: string;
  activated_at?: string;
  terminated_at?: string;
}

const statusConfig = {
  DRAFT: { label: 'Concept', variant: 'secondary' as const, icon: Edit },
  PENDING_REVIEW: { label: 'In Review', variant: 'warning' as const, icon: Clock },
  PENDING_APPROVAL: { label: 'Goedkeuring', variant: 'warning' as const, icon: Clock },
  APPROVED: { label: 'Goedgekeurd', variant: 'success' as const, icon: CheckCircle },
  PENDING_SIGNATURE: { label: 'Te Tekenen', variant: 'warning' as const, icon: FileSignature },
  PARTIALLY_SIGNED: { label: 'Deels Getekend', variant: 'warning' as const, icon: FileSignature },
  FULLY_SIGNED: { label: 'Getekend', variant: 'success' as const, icon: CheckCircle },
  ACTIVE: { label: 'Actief', variant: 'success' as const, icon: CheckCircle },
  COMPLETED: { label: 'Voltooid', variant: 'default' as const, icon: CheckCircle },
  CANCELLED: { label: 'Geannuleerd', variant: 'destructive' as const, icon: XCircle },
  TERMINATED: { label: 'Beëindigd', variant: 'destructive' as const, icon: XCircle },
};

const contractTypeLabels = {
  VAST: 'Vast Contract',
  INTERIM: 'Interim',
  UITZENDEN: 'Uitzendkracht',
};

export function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchContracts();
  }, [statusFilter, typeFilter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {params.append('status', statusFilter);}
      if (typeFilter !== 'all') {params.append('type', typeFilter);}

      const response = await apiGet(`/api/v2/contracts?${params}`);
      setContracts(response.data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      const errorMessage = error instanceof ApiError ? error.message : 'Kon contracten niet laden';
      toast({
        title: 'Fout',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (contract: Contract) => {
    setLocation(`/contracts/${contract.id}`);
  };

  const handleSign = (contract: Contract) => {
    setLocation(`/contracts/${contract.id}/sign`);
  };

  const handleDownload = async (contract: Contract) => {
    try {
      const response = await fetch(`/api/v2/contracts/${contract.id}/download`, {
        credentials: 'include'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.contract_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Kon contract niet downloaden',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) {return '-';}
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {return <Badge variant="default">{status}</Badge>;}

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canSign = (contract: Contract) => {
    return ['PENDING_SIGNATURE', 'PARTIALLY_SIGNED'].includes(contract.status);
  };

  const canActivate = (contract: Contract) => {
    return contract.status === 'FULLY_SIGNED';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contracten
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Statussen</SelectItem>
                <SelectItem value="DRAFT">Concept</SelectItem>
                <SelectItem value="PENDING_SIGNATURE">Te Tekenen</SelectItem>
                <SelectItem value="ACTIVE">Actief</SelectItem>
                <SelectItem value="TERMINATED">Beëindigd</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="VAST">Vast</SelectItem>
                <SelectItem value="INTERIM">Interim</SelectItem>
                <SelectItem value="UITZENDEN">Uitzendkracht</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setLocation('/contracts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Contract
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Geen contracten gevonden
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Nr.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kandidaat</TableHead>
                <TableHead>Functie</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Tarief</TableHead>
                <TableHead>Handtekeningen</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.contract_number}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {contractTypeLabels[contract.contract_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>{contract.candidate_name || '-'}</TableCell>
                  <TableCell>{contract.job_title || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(contract.start_date), 'dd MMM yyyy', {
                      locale: nl,
                    })}
                  </TableCell>
                  <TableCell>
                    {contract.contract_type === 'VAST'
                      ? formatCurrency(contract.salary_amount)
                      : contract.hourly_rate
                      ? `€${contract.hourly_rate}/uur`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className={
                        contract.signatures_received === contract.signatures_required
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }>
                        {contract.signatures_received}/{contract.signatures_required}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(contract)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canSign(contract) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSign(contract)}
                        >
                          <FileSignature className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(contract)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}