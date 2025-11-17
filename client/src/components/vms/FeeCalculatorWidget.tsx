/**
 * Fee Calculator Widget Component
 *
 * Calculates placement fees based on bureau's fee structure
 * Features:
 * - Input: salary/hourly rate, contract type, duration
 * - Displays calculated fee with breakdown
 * - Supports percentage, fixed amount, and hourly markup
 * - Real-time calculation
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiGet, ApiError } from '@/lib/api-client';
import { Calculator, TrendingUp, DollarSign, Info } from 'lucide-react';

interface FeeStructure {
  id: string;
  feeType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'HOURLY_MARKUP';
  placementFeePercentage?: number;
  fixedPlacementFee?: number;
  hourlyMarkupPercentage?: number;
  paymentTermsDays: number;
  guaranteePeriodDays: number;
}

interface FeeCalculation {
  baseFee: number;
  discountAmount: number;
  totalFee: number;
  bureauRate?: number;
  markup?: number;
  breakdown: string[];
}

type ContractType = 'PERMANENT' | 'INTERIM' | 'TEMPORARY';

interface FeeCalculatorWidgetProps {
  bureauId?: string;
  defaultFeeStructure?: FeeStructure;
  onCalculationChange?: (calculation: FeeCalculation) => void;
}

export function FeeCalculatorWidget({
  bureauId,
  defaultFeeStructure,
  onCalculationChange,
}: FeeCalculatorWidgetProps) {
  const [contractType, setContractType] = useState<ContractType>('PERMANENT');
  const [annualSalary, setAnnualSalary] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [contractDuration, setContractDuration] = useState<number>(6); // months
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(defaultFeeStructure || null);
  const [calculation, setCalculation] = useState<FeeCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (bureauId && !defaultFeeStructure) {
      fetchFeeStructure();
    }
  }, [bureauId]);

  useEffect(() => {
    if (feeStructure) {
      calculateFee();
    }
  }, [contractType, annualSalary, hourlyRate, contractDuration, feeStructure]);

  const fetchFeeStructure = async () => {
    if (!bureauId) {return;}

    setLoading(true);
    try {
      const data = await apiGet(`/api/vms/bureaus/${bureauId}/fee-structure`);
      setFeeStructure(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load fee structure',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    if (!feeStructure) {return;}

    let baseFee = 0;
    let bureauRate = 0;
    let markup = 0;
    const breakdown: string[] = [];

    switch (feeStructure.feeType) {
      case 'PERCENTAGE':
        if (contractType === 'PERMANENT' && annualSalary > 0 && feeStructure.placementFeePercentage) {
          baseFee = (annualSalary * feeStructure.placementFeePercentage) / 100;
          breakdown.push(
            `Annual Salary: €${annualSalary.toLocaleString()}`,
            `Fee Percentage: ${feeStructure.placementFeePercentage}%`,
            `Base Fee: €${baseFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          );
        }
        break;

      case 'FIXED_AMOUNT':
        if (feeStructure.fixedPlacementFee) {
          baseFee = feeStructure.fixedPlacementFee;
          breakdown.push(`Fixed Placement Fee: €${baseFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
        break;

      case 'HOURLY_MARKUP':
        if ((contractType === 'INTERIM' || contractType === 'TEMPORARY') && hourlyRate > 0 && feeStructure.hourlyMarkupPercentage) {
          markup = (hourlyRate * feeStructure.hourlyMarkupPercentage) / 100;
          bureauRate = hourlyRate + markup;

          // Calculate total fee based on contract duration (assuming 40 hours/week, 4 weeks/month)
          const estimatedHours = contractDuration * 160; // 160 hours per month
          baseFee = markup * estimatedHours;

          breakdown.push(
            `Candidate Hourly Rate: €${hourlyRate.toFixed(2)}`,
            `Markup Percentage: ${feeStructure.hourlyMarkupPercentage}%`,
            `Hourly Markup: €${markup.toFixed(2)}`,
            `Bureau Hourly Rate: €${bureauRate.toFixed(2)}`,
            `Estimated Duration: ${contractDuration} months (${estimatedHours} hours)`,
            `Total Markup Fee: €${baseFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          );
        }
        break;
    }

    // For now, no volume discounts (can be added later)
    const discountAmount = 0;
    const totalFee = baseFee - discountAmount;

    const result: FeeCalculation = {
      baseFee,
      discountAmount,
      totalFee,
      bureauRate: bureauRate > 0 ? bureauRate : undefined,
      markup: markup > 0 ? markup : undefined,
      breakdown,
    };

    setCalculation(result);
    onCalculationChange?.(result);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-500">Loading fee structure...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feeStructure) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No fee structure available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Fee Calculator
        </CardTitle>
        <CardDescription>
          Calculate placement fees based on your bureau's fee structure
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Fee Structure Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Fee Type:</span>
              <Badge className="ml-2" variant="outline">
                {feeStructure.feeType.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>Payment Terms: Net {feeStructure.paymentTermsDays} days</div>
              <div>Guarantee: {feeStructure.guaranteePeriodDays} days</div>
            </div>
          </div>
        </div>

        {/* Contract Type Selection */}
        <div className="space-y-2">
          <Label>Contract Type</Label>
          <Select value={contractType} onValueChange={(value) => setContractType(value as ContractType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERMANENT">Permanent</SelectItem>
              <SelectItem value="INTERIM">Interim</SelectItem>
              <SelectItem value="TEMPORARY">Temporary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Fields */}
        {contractType === 'PERMANENT' && feeStructure.feeType === 'PERCENTAGE' && (
          <div className="space-y-2">
            <Label>Annual Salary (€)</Label>
            <Input
              type="number"
              placeholder="60000"
              value={annualSalary || ''}
              onChange={(e) => setAnnualSalary(parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {(contractType === 'INTERIM' || contractType === 'TEMPORARY') && feeStructure.feeType === 'HOURLY_MARKUP' && (
          <>
            <div className="space-y-2">
              <Label>Candidate Hourly Rate (€)</Label>
              <Input
                type="number"
                placeholder="75"
                step="0.01"
                value={hourlyRate || ''}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Contract Duration (months)</Label>
              <Input
                type="number"
                placeholder="6"
                min="1"
                value={contractDuration || ''}
                onChange={(e) => setContractDuration(parseInt(e.target.value) || 0)}
              />
            </div>
          </>
        )}

        {/* Calculation Result */}
        {calculation && calculation.totalFee > 0 && (
          <>
            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Fee Breakdown
              </h3>

              <div className="space-y-2 text-sm">
                {calculation.breakdown.map((line, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{line.split(':')[0]}:</span>
                    <span className="font-medium">{line.split(':')[1]}</span>
                  </div>
                ))}
              </div>

              {calculation.discountAmount > 0 && (
                <div className="flex justify-between items-center py-1 text-green-600">
                  <span>Volume Discount:</span>
                  <span className="font-medium">-{formatCurrency(calculation.discountAmount)}</span>
                </div>
              )}

              <Separator />

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Fee:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {formatCurrency(calculation.totalFee)}
                  </span>
                </div>
                {calculation.bureauRate && (
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">Bureau Hourly Rate:</span>
                    <span className="font-medium">{formatCurrency(calculation.bureauRate)}/hour</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* No calculation yet */}
        {(!calculation || calculation.totalFee === 0) && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Enter values above to calculate fees</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
