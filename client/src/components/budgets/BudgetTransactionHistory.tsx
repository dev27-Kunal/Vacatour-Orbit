/**
 * Budget Transaction History Component
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { budgetApi, budgetQueryKeys } from '@/lib/api/budgets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';

interface BudgetTransactionHistoryProps {
  budgetId: string;
}

export function BudgetTransactionHistory({ budgetId }: BudgetTransactionHistoryProps) {
  const { data, isLoading } = useQuery({
    queryKey: budgetQueryKeys.transactions(budgetId),
    queryFn: () => budgetApi.getTransactions(budgetId, { limit: 50 }),
  });

  if (isLoading) {return <div className="animate-pulse h-64 bg-muted rounded"></div>;}

  const transactions = data?.data?.transactions || [];
  const summary = data?.data?.summary;

  const getIcon = (type: string) => {
    if (type === 'DEDUCTION') {return <ArrowDown className="h-4 w-4 text-destructive" />;}
    if (type === 'ALLOCATION' || type === 'REFUND') {return <ArrowUp className="h-4 w-4 text-green-600" />;}
    return <RefreshCw className="h-4 w-4 text-blue-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        {summary && (
          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
            <div>
              <p className="text-muted-foreground">Deductions</p>
              <p className="font-bold">€{summary.totalDeductions?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Allocations</p>
              <p className="font-bold">€{summary.totalAllocations?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Adjustments</p>
              <p className="font-bold">€{summary.totalAdjustments?.toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn: any) => (
              <TableRow key={txn.id}>
                <TableCell>{new Date(txn.transaction_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getIcon(txn.transaction_type)}
                    <Badge variant="outline">{txn.transaction_type}</Badge>
                  </div>
                </TableCell>
                <TableCell className={txn.transaction_type === 'DEDUCTION' ? 'text-destructive' : 'text-green-600'}>
                  {txn.transaction_type === 'DEDUCTION' ? '-' : '+'}€{Math.abs(txn.amount).toLocaleString()}
                </TableCell>
                <TableCell>€{parseFloat(txn.running_balance).toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{txn.description || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default BudgetTransactionHistory;
