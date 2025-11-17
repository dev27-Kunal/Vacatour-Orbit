/**
 * Bureau Contract View Component
 *
 * Displays contract information from a bureau perspective.
 * Shows key terms, rates, and performance against the contract.
 *
 * Features:
 * - Contract summary
 * - Rate card display
 * - Performance metrics
 * - Renewal tracking
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface BureauContractViewProps {
  contract: {
    id: string;
    contractNumber: string;
    companyName: string;
    status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
    startDate: string;
    endDate?: string;
    placementFeePercentage?: number;
    hourlyMarkupPercentage?: number;
    fixedPlacementFee?: number;
    paymentTermsDays: number;
    guaranteePeriodDays: number;
    totalPlacements: number;
    totalEarnings: number;
    averageTimeToFill: number;
  };
  onViewDetails?: () => void;
  compact?: boolean;
}

export function BureauContractView({ contract, onViewDetails, compact = false }: BureauContractViewProps) {
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
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const isExpiringSoon = () => {
    if (!contract.endDate) {return false;}
    const daysUntilExpiry = Math.floor(
      (new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 60;
  };

  const getRateDisplay = () => {
    if (contract.placementFeePercentage) {
      return `${contract.placementFeePercentage}% placement fee`;
    }
    if (contract.hourlyMarkupPercentage) {
      return `${contract.hourlyMarkupPercentage}% hourly markup`;
    }
    if (contract.fixedPlacementFee) {
      return `€${contract.fixedPlacementFee.toLocaleString()} fixed fee`;
    }
    return 'Rate not specified';
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <h3 className="font-semibold">{contract.companyName}</h3>
                {isExpiringSoon() && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                    Expiring Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">Contract #{contract.contractNumber}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {getRateDisplay()}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {contract.totalPlacements} placements
                </span>
              </div>
            </div>
            <Badge className={statusColors[contract.status]}>
              {getStatusIcon(contract.status)}
              <span className="ml-1">{contract.status}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {contract.companyName}
              {isExpiringSoon() && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                  Expiring Soon
                </Badge>
              )}
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
        {/* Contract Details */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contract Terms</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">
                  {new Date(contract.startDate).toLocaleDateString()}
                </span>
              </div>
              {contract.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">End:</span>
                  <span className="font-medium">
                    {new Date(contract.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium">Net {contract.paymentTermsDays} days</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Guarantee:</span>
                <span className="font-medium">{contract.guaranteePeriodDays} days</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Rate Structure</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">{getRateDisplay()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="pt-6 border-t grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Placements</p>
            <p className="text-2xl font-bold text-blue-600">{contract.totalPlacements}</p>
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

        {/* Actions */}
        {onViewDetails && (
          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <FileText className="mr-2 h-4 w-4" />
              View Full Contract
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
