/**
 * Contracts Overview Page
 * Main page for contract management
 */

import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { PageWrapper } from '@/components/page-wrapper';
import { ContractList } from '@/components/contracts/ContractList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSignature,
  Users,
  Building,
  Euro,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface ContractStats {
  total: number;
  active: number;
  pending_signature: number;
  draft: number;
  total_value: number;
  this_month: number;
}

interface ContractsPageProps {
  stats?: ContractStats;
}

export default function ContractsPage({ stats }: ContractsPageProps) {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();

  const defaultStats: ContractStats = {
    total: 0,
    active: 0,
    pending_signature: 0,
    draft: 0,
    total_value: 0,
    this_month: 0,
  };

  const contractStats = stats || defaultStats;

  // Align client language with cookie if present (when coming from SPA toggle)
  useEffect(() => {
    try {
      const match = typeof document !== 'undefined' && document.cookie.match(/(?:^|;\s*)i18next=([^;]+)/);
      const cookieLang = match ? decodeURIComponent(match[1]) : null;
      if (cookieLang && cookieLang !== i18n.language) {
        i18n.changeLanguage(cookieLang);
      }
    } catch {}
  }, [i18n]);

  return (
    <PageWrapper>
      <Head>
        <title>{`${t('contracts.title')} | TalentFlow`}</title>
        <meta name="description" content={t('contracts.overview.subtitle')} />
      </Head>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('contracts.title')}</h1>
            <p className="text-muted-foreground">{t('contracts.overview.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation('/contracts/templates')}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t('contracts.templatesButton')}
            </Button>
            <Button onClick={() => setLocation('/contracts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('contracts.newTitle')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('contracts.overview.totalContracts')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{contractStats.this_month} {t('contracts.overview.thisMonth')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('contracts.overview.active')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractStats.active}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('contracts.overview.active')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('contracts.overview.toSign')}
              </CardTitle>
              <FileSignature className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contractStats.pending_signature}
              </div>
              <div className="flex items-center text-xs text-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                {t('contracts.overview.toSign')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('contracts.overview.totalValue')}
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{contractStats.total_value.toLocaleString(i18n.language)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('contracts.overview.totalValueDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation('/contracts/new')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5" />
                {t('contracts.newTitle')}
              </CardTitle>
              <CardDescription>
                {t('contracts.overview.newContractDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation('/contracts/msa')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                {t('navigation.msaManagement')}
              </CardTitle>
              <CardDescription>
                {t('msa.subtitle')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setLocation('/contracts/rate-cards')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Euro className="h-5 w-5" />
                {t('contracts.overview.rateCards')}
              </CardTitle>
              <CardDescription>
                {t('contracts.overview.rateCardsDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Contract Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">{t('contracts.overview.tabs.all')}</TabsTrigger>
            <TabsTrigger value="action-required">
              {t('contracts.overview.tabs.actionRequired')}
              {contractStats.pending_signature > 0 && (
                <span className="ml-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {contractStats.pending_signature}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="draft">{t('contracts.overview.tabs.drafts')}</TabsTrigger>
            <TabsTrigger value="active">{t('contracts.overview.tabs.active')}</TabsTrigger>
            <TabsTrigger value="completed">{t('contracts.overview.tabs.completed')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ContractList />
          </TabsContent>

          <TabsContent value="action-required">
            <ContractList />
          </TabsContent>

          <TabsContent value="draft">
            <ContractList />
          </TabsContent>

          <TabsContent value="active">
            <ContractList />
          </TabsContent>

          <TabsContent value="completed">
            <ContractList />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Check if user has permission to view contracts
  const userType = session.user?.userType;
  if (!['BEDRIJF', 'BUREAU', 'ADMIN'].includes(userType)) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  // TODO: Fetch actual stats from API
  const stats: ContractStats = {
    total: 42,
    active: 28,
    pending_signature: 5,
    draft: 3,
    total_value: 1250000,
    this_month: 8,
  };

  return {
    props: {
      session,
      stats,
    },
  };
};
