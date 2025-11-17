/**
 * Bureau Portal - Rate Card Management
 *
 * View and manage bureau rate cards for different role categories and seniority levels.
 * Allows bureaus to see their agreed rates with different companies.
 *
 * Features:
 * - View all rate cards across contracts
 * - Filter by company, role category, or seniority
 * - Compare rates across companies
 * - Rate card effectiveness analytics
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/providers/AppProvider';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign,
  Building2,
  Search,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  FileText,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { apiGet, ApiError } from '@/lib/api-client';

interface RateCard {
  id: string;
  contractId: string;
  contractNumber: string;
  companyId: string;
  companyName: string;
  roleCategory: string;
  seniorityLevel: string;

  // Fee Structure
  placementFeePercentage?: number;
  hourlyMarkupPercentage?: number;
  fixedFee?: number;

  // Salary Range
  minimumSalary?: number;
  maximumSalary?: number;

  // Performance
  placementsMade: number;
  totalEarnings: number;
  averagePlacementFee: number;

  // Status
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
}

interface RateComparison {
  roleCategory: string;
  seniorityLevel: string;
  minRate: number;
  maxRate: number;
  avgRate: number;
  count: number;
}

function BureauPortalRates() {
  const { user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [seniorityFilter, setSeniorityFilter] = useState<string>('ALL');

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
      fetchRateCards();
    }
  }, [user]);

  const fetchRateCards = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: RateCard[] }>('/api/vms/bureaus/rate-cards');
      setRateCards(data.data || []);
    } catch (error) {
      console.error('Failed to fetch rate cards:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load rate cards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRates = rateCards.filter((rate) => {
    const matchesSearch =
      rate.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.roleCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.seniorityLevel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      companyFilter === 'ALL' || rate.companyName === companyFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || rate.roleCategory === categoryFilter;

    const matchesSeniority =
      seniorityFilter === 'ALL' || rate.seniorityLevel === seniorityFilter;

    return matchesSearch && matchesCompany && matchesCategory && matchesSeniority;
  });

  const uniqueCompanies = Array.from(new Set(rateCards.map((r) => r.companyName)));
  const uniqueCategories = Array.from(new Set(rateCards.map((r) => r.roleCategory)));
  const uniqueSeniorities = Array.from(new Set(rateCards.map((r) => r.seniorityLevel)));

  const getRateComparisons = (): RateComparison[] => {
    const comparisons: Record<string, RateComparison> = {};

    filteredRates.forEach((rate) => {
      const key = `${rate.roleCategory}-${rate.seniorityLevel}`;
      const feeValue = rate.placementFeePercentage || rate.hourlyMarkupPercentage || 0;

      if (!comparisons[key]) {
        comparisons[key] = {
          roleCategory: rate.roleCategory,
          seniorityLevel: rate.seniorityLevel,
          minRate: feeValue,
          maxRate: feeValue,
          avgRate: feeValue,
          count: 1,
        };
      } else {
        comparisons[key].minRate = Math.min(comparisons[key].minRate, feeValue);
        comparisons[key].maxRate = Math.max(comparisons[key].maxRate, feeValue);
        comparisons[key].avgRate =
          (comparisons[key].avgRate * comparisons[key].count + feeValue) /
          (comparisons[key].count + 1);
        comparisons[key].count += 1;
      }
    });

    return Object.values(comparisons);
  };

  const formatFee = (rate: RateCard) => {
    if (rate.placementFeePercentage) {
      return `${rate.placementFeePercentage}% of annual salary`;
    }
    if (rate.hourlyMarkupPercentage) {
      return `${rate.hourlyMarkupPercentage}% hourly markup`;
    }
    if (rate.fixedFee) {
      return `€${rate.fixedFee.toLocaleString()} fixed fee`;
    }
    return 'Not specified';
  };

  const totalEarnings = filteredRates.reduce((sum, rate) => sum + rate.totalEarnings, 0);
  const totalPlacements = filteredRates.reduce((sum, rate) => sum + rate.placementsMade, 0);
  const avgFeePerPlacement = totalPlacements > 0 ? totalEarnings / totalPlacements : 0;

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please log in to view rate cards</p>
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
              <BreadcrumbLink href="/dashboard">{t('navigation.dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/bureau-portal">{t('navigation.bureauPortal')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.rateCards')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.rateCards')}</h1>
          <p className="text-muted-foreground mt-2">
            View and analyze your agreed rates across all contracts
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rate Cards</p>
                  <p className="text-3xl font-bold mt-2">{filteredRates.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Companies</p>
                  <p className="text-3xl font-bold mt-2">
                    {new Set(filteredRates.map((r) => r.companyId)).size}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Placements</p>
                  <p className="text-3xl font-bold mt-2">{totalPlacements}</p>
                </div>
                <Users className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Fee/Placement</p>
                  <p className="text-3xl font-bold mt-2">
                    €{avgFeePerPlacement.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies, roles, or seniority levels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Companies</SelectItem>
              {uniqueCompanies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by seniority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              {uniqueSeniorities.map((seniority) => (
                <SelectItem key={seniority} value={seniority}>
                  {seniority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading rate cards...</p>
          </div>
        ) : filteredRates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Rate Cards Found</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || companyFilter !== 'ALL' || categoryFilter !== 'ALL' || seniorityFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'No rate cards available. Contact your account manager to set up rates.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Rate Cards Table */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Cards</CardTitle>
                <CardDescription>
                  Showing {filteredRates.length} rate card{filteredRates.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Company</th>
                        <th className="px-4 py-3 text-left font-medium">Role Category</th>
                        <th className="px-4 py-3 text-left font-medium">Seniority</th>
                        <th className="px-4 py-3 text-left font-medium">Fee Structure</th>
                        <th className="px-4 py-3 text-right font-medium">Placements</th>
                        <th className="px-4 py-3 text-right font-medium">Earnings</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredRates.map((rate) => (
                        <tr key={rate.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{rate.companyName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{rate.roleCategory}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{rate.seniorityLevel}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-gray-500" />
                              {formatFee(rate)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">{rate.placementsMade}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            €{rate.totalEarnings.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant={rate.isActive ? 'default' : 'secondary'}
                              className={rate.isActive ? 'bg-green-100 text-green-800' : ''}
                            >
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Rate Comparison */}
            {getRateComparisons().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Rate Comparison Analysis
                  </CardTitle>
                  <CardDescription>
                    Compare your rates across different companies for the same role/seniority combinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Role Category</th>
                          <th className="px-4 py-3 text-left font-medium">Seniority</th>
                          <th className="px-4 py-3 text-right font-medium">Min Rate</th>
                          <th className="px-4 py-3 text-right font-medium">Avg Rate</th>
                          <th className="px-4 py-3 text-right font-medium">Max Rate</th>
                          <th className="px-4 py-3 text-right font-medium">Companies</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {getRateComparisons().map((comparison, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{comparison.roleCategory}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{comparison.seniorityLevel}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">{comparison.minRate.toFixed(1)}%</td>
                            <td className="px-4 py-3 text-right font-medium">
                              {comparison.avgRate.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-right text-green-600 font-medium">
                              {comparison.maxRate.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-right">{comparison.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default withVMSErrorBoundary(
  BureauPortalRates,
  'Failed to load rate cards. Please try again.'
);
