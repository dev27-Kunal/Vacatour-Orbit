import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import type { Payment } from "@/types/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Filter,
  Search,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { isAfter, isBefore, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { I18nFormatters } from "@/lib/i18n-formatters";
import { apiGet } from "@/lib/api-client";


export function PaymentHistory() {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Create formatters for current locale
  const formatters = new I18nFormatters(i18n.language);

  // Get payment history
  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const response = await apiGet<Payment[]>("/api/payments");
      return response.data || [];
    },
  });

  // Filter payments
  const filteredPayments = (payments || []).filter(payment => {
    // Status filter
    if (statusFilter !== 'all' && payment.status.toLowerCase() !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'this-month':
          if (!isAfter(paymentDate, startOfMonth(now)) || !isBefore(paymentDate, endOfMonth(now))) {
            return false;
          }
          break;
        case 'last-month':
          const lastMonth = subMonths(now, 1);
          if (!isAfter(paymentDate, startOfMonth(lastMonth)) || !isBefore(paymentDate, endOfMonth(lastMonth))) {
            return false;
          }
          break;
        case 'last-3-months':
          const threeMonthsAgo = subMonths(now, 3);
          if (!isAfter(paymentDate, threeMonthsAgo)) {
            return false;
          }
          break;
      }
    }

    // Search filter
    if (searchTerm && !payment.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const totalAmount = filteredPayments.reduce((sum, payment) => 
    payment.status === 'COMPLETED' ? sum + payment.amount : sum, 0
  );
  const successfulPayments = filteredPayments.filter(p => p.status === 'COMPLETED').length;
  const failedPayments = filteredPayments.filter(p => p.status === 'FAILED').length;
  const refundedAmount = filteredPayments.reduce((sum, payment) => 
    sum + (payment.refundAmount || 0), 0
  );

  const handleDownloadInvoice = async (paymentId: string, invoiceUrl?: string) => {
    if (!invoiceUrl) {
      toast({
        title: t('common.error'),
        description: t('subscription.payments.invoice.noInvoice'),
        variant: "destructive",
      });
      return;
    }

    setDownloadingInvoice(paymentId);

    try {
      // Create a download request - use regular fetch for blob response
      const response = await fetch(`/api/payments/${paymentId}/invoice`, {
        credentials: 'include'
      });
      if (!response.ok) {throw new Error('Failed to download invoice');}

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t('common.success'),
        description: t('subscription.payments.invoice.downloadSuccess'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('subscription.payments.invoice.downloadError'),
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'REFUNDED':
        return <XCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">{t('subscription.payments.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('subscription.payments.error')}</h3>
            <p>{t('subscription.payments.errorMessage')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{t('subscription.payments.statistics.totalPaid')}</p>
                <p className="text-xl font-bold">{formatters.formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t('subscription.payments.statistics.successful')}</p>
                <p className="text-xl font-bold">{formatters.formatNumber(successfulPayments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">{t('subscription.payments.statistics.failed')}</p>
                <p className="text-xl font-bold">{formatters.formatNumber(failedPayments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">{t('subscription.payments.statistics.refunded')}</p>
                <p className="text-xl font-bold">{formatters.formatCurrency(refundedAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('subscription.payments.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t('subscription.payments.filters.search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder={t('subscription.payments.filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">{t('subscription.payments.filters.status')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('subscription.payments.filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('subscription.payments.filters.allStatuses')}</SelectItem>
                  <SelectItem value="completed">{t('subscription.payments.status.COMPLETED')}</SelectItem>
                  <SelectItem value="pending">{t('subscription.payments.status.PENDING')}</SelectItem>
                  <SelectItem value="failed">{t('subscription.payments.status.FAILED')}</SelectItem>
                  <SelectItem value="refunded">{t('subscription.payments.status.REFUNDED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">{t('subscription.payments.filters.period')}</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('subscription.payments.filters.allDates')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('subscription.payments.filters.allDates')}</SelectItem>
                  <SelectItem value="this-month">{t('subscription.payments.filters.thisMonth')}</SelectItem>
                  <SelectItem value="last-month">{t('subscription.payments.filters.lastMonth')}</SelectItem>
                  <SelectItem value="last-3-months">{t('subscription.payments.filters.last3Months')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchTerm('');
                }}
                className="w-full"
              >
                {t('subscription.payments.filters.resetFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('subscription.payments.title')}
            </span>
            <span className="text-sm font-normal text-gray-600">
              {t('subscription.payments.count', { count: filteredPayments.length })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getStatusIcon(payment.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {formatters.formatCurrency(payment.amount)} {payment.currency.toUpperCase()}
                        </p>
                        <Badge className={`${getStatusColor(payment.status)} text-xs`}>
                          {t(`subscription.payments.status.${payment.status}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{payment.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatters.formatDateTime(payment.createdAt)}
                        </span>
                        {payment.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {payment.paymentMethod.brand.toUpperCase()} ****{payment.paymentMethod.last4}
                          </span>
                        )}
                      </div>
                      {payment.failureReason && (
                        <p className="text-xs text-red-600 mt-1">{t('subscription.payments.failureReason', { reason: payment.failureReason })}</p>
                      )}
                      {payment.refundAmount && (
                        <p className="text-xs text-orange-600 mt-1">
                          {t('subscription.payments.refundAmount', { amount: formatters.formatCurrency(payment.refundAmount) })}
                          {payment.refundReason && ` (${payment.refundReason})`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.invoiceUrl && payment.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(payment.id, payment.invoiceUrl)}
                        disabled={downloadingInvoice === payment.id}
                        className="flex items-center gap-2"
                      >
                        {downloadingInvoice === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        {downloadingInvoice === payment.id 
                          ? t('subscription.payments.actions.downloading')
                          : t('subscription.payments.actions.downloadInvoice')
                        }
                      </Button>
                    )}
                    {payment.receiptUrl && payment.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.receiptUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {t('subscription.payments.actions.downloadReceipt')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {payments && payments.length > 0 
                    ? t('subscription.payments.empty.noResults')
                    : t('subscription.payments.empty.noPayments')
                  }
                </h3>
                <p className="text-gray-600">
                  {payments && payments.length > 0
                    ? t('subscription.payments.empty.noResultsMessage')
                    : t('subscription.payments.empty.noPaymentsMessage')
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}