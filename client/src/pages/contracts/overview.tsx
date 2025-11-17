import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { apiGet } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, AlertCircle, Plus, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Contract = {
  id: string;
  contract_number?: string;
  status?: string;
  contract_type?: string;
  end_date?: string | null;
};

type ContractsResponse = {
  contracts: Contract[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function ContractsOverviewPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGet<ContractsResponse>('/api/vms/contracts', { page: 1, limit: 20 });
        if (mounted) {
          setContracts(res.data?.contracts || []);
        }
      } catch (e: any) {
        if (mounted) {setError(e?.message || 'Kon contracten niet ophalen');}
      } finally {
        if (mounted) {setLoading(false);}
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const total = contracts.length;
  const active = contracts.filter(c => c.status === 'ACTIVE').length;
  const pending = contracts.filter(c => c.status === 'PENDING_SIGNATURE' || c.status === 'PARTIALLY_SIGNED').length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('contracts.title')}</h1>
          <p className="text-muted-foreground">{t('contracts.overview.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contracts/templates">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" /> {t('contracts.templatesButton')}
            </Button>
          </Link>
          <Link href="/contracts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> {t('contracts.newTitle')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-indigo-600" /> {t('contracts.overview.totalContracts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> {t('contracts.overview.active')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-orange-600" /> {t('contracts.overview.toSign')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
              <CardTitle className="text-base">{t('contracts.overview.latest')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">{t('common.loading')}</div>
          ) : contracts.length === 0 ? (
            <div className="text-sm text-gray-500">{t('contracts.overview.noContracts')}</div>
          ) : (
            <div className="divide-y">
              {contracts.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{c.contract_number || c.id}</div>
                    <div className="text-xs text-gray-500">{c.contract_type || 'CONTRACT'} · {c.status || 'ONBEKEND'}</div>
                  </div>
                  <Link href={`/contracts/${c.id}`}>
                    <Button variant="outline" size="sm">{t('common.details')}</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
              <CardTitle className="text-base">{t('contracts.overview.templatesMsa')}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/contracts/templates"><Button variant="secondary"><FileText className="h-4 w-4 mr-2"/>{t('contracts.templatesButton')}</Button></Link>
            <Link href="/contracts/msa"><Button variant="secondary"><Shield className="h-4 w-4 mr-2"/>{t('navigation.msaManagement')}</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
