/**
 * Bureau Rankings Page
 *
 * Full-page view of bureau performance rankings with detailed metrics.
 * Features:
 * - Complete leaderboard with all bureaus
 * - Advanced filtering and sorting
 * - Performance comparison tools
 * - Detailed metrics view
 * - Accessible to both bureaus (to see their rank) and companies (to find top performers)
 */

import React, { useEffect } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BureauRankingsLeaderboard } from '@/components/vms/BureauRankingsLeaderboard';
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
  Trophy,
  TrendingUp,
  Award,
  Info,
  Target,
  Users,
  Clock,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

function BureauRankings() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    // This page is accessible to both BUREAU and BEDRIJF users
    if (user && user.userType !== 'BUREAU' && user.userType !== 'BEDRIJF') {
      toast({
        title: t('bureauRankings.accessDeniedTitle'),
        description: t('bureauRankings.accessDeniedMessage'),
        variant: 'destructive',
      });
      setLocation('/dashboard');
    }
  }, [user]);

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('bureauRankings.loginPrompt')}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isBureau = user.userType === 'BUREAU';
  const isCompany = user.userType === 'BEDRIJF';

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{t('navigation.dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={isBureau ? '/vms/bureau' : '/vms/company'}>
                {isBureau ? t('navigation.bureauVMS') : t('navigation.companyVMS')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('bureauRankings.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              {t('bureauRankings.title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isBureau ? t('bureauRankings.subtitleBureau') : t('bureauRankings.subtitleCompany')}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation(isBureau ? '/vms/bureau' : '/vms/company')}
          >
            {t('common.backToDashboard')}
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Performance Score Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t('bureauRankings.info.performanceScore')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('bureauRankings.info.performanceScoreDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fill Rate Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t('bureauRankings.info.fillRate')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('bureauRankings.info.fillRateDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Rate Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t('bureauRankings.info.responseRate')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('bureauRankings.info.responseRateDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placements Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t('bureauRankings.info.totalPlacements')}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('bureauRankings.info.totalPlacementsDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tier Legend */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{t('bureauRankings.tiers.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="flex flex-col gap-2">
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 justify-center">
                  💎 PLATINUM
                </Badge>
                <p className="text-xs text-gray-600 text-center">{t('bureauRankings.tiers.platinumDesc')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 justify-center">
                  🥇 GOLD
                </Badge>
                <p className="text-xs text-gray-600 text-center">{t('bureauRankings.tiers.goldDesc')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-gray-200 text-gray-800 border-gray-300 justify-center">
                  🥈 SILVER
                </Badge>
                <p className="text-xs text-gray-600 text-center">{t('bureauRankings.tiers.silverDesc')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 justify-center">
                  🥉 BRONZE
                </Badge>
                <p className="text-xs text-gray-600 text-center">{t('bureauRankings.tiers.bronzeDesc')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 justify-center">
                  🆕 NEW
                </Badge>
                <p className="text-xs text-gray-600 text-center">{t('bureauRankings.tiers.newDesc')}</p>
              </div>
            </div>

            {isBureau && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">{t('bureauRankings.improveTitle')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('bureauRankings.improveDesc')}</p>
                  </div>
                </div>
              </div>
            )}

            {isCompany && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">{t('bureauRankings.findBestTitle')}</p>
                    <p className="text-sm text-green-700 mt-1">{t('bureauRankings.findBestDesc')}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Main Leaderboard */}
        <BureauRankingsLeaderboard />

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-2">{t('bureauRankings.about.title')}</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t('bureauRankings.about.updatedDaily')}</li>
                  <li>{t('bureauRankings.about.weightedAlgo')}</li>
                  <li>{t('bureauRankings.about.weights')}</li>
                  <li>{t('bureauRankings.about.thresholdPlacements')}</li>
                  <li>{t('bureauRankings.about.aggregationNote')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {isBureau && (
            <Button onClick={() => setLocation('/vms/bureau')} size="lg">
              {t('bureauRankings.actions.viewMyDashboard')}
            </Button>
          )}
          {isCompany && (
            <Button onClick={() => setLocation('/vms/company')} size="lg">
              {t('bureauRankings.actions.distributeJob')}
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(BureauRankings, 'Failed to load Bureau Rankings. Please try again.');
