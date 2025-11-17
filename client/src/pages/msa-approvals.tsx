/**
 * MSA Approvals Page
 *
 * Displays all Master Service Agreements awaiting approval from the current user.
 * Allows users to review and approve/reject MSAs.
 *
 * Features:
 * - List of pending MSAs
 * - Quick view of MSA details
 * - Click to open approval modal
 * - Empty state when no approvals needed
 * - Loading and error states
 */

import React, { useState } from 'react';
import { useApp } from '@/providers/AppProvider';
import { useMSAsAwaitingApproval } from '@/hooks/useMSAApproval';
import { MSAApprovalModal } from '@/components/msa/MSAApprovalModal';
import { MSADocument } from '@/types/msa';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MSAApprovalsPage() {
  const { user } = useApp();
  const { data: msas, isLoading, error, refetch } = useMSAsAwaitingApproval();
  const [selectedMSA, setSelectedMSA] = useState<MSADocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenMSA = (msa: MSADocument) => {
    setSelectedMSA(msa);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Keep selectedMSA for a moment to prevent flashing
    setTimeout(() => setSelectedMSA(null), 300);
  };

  const handleSuccess = () => {
    refetch();
  };

  if (!user) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view MSA approvals.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>MSA Approvals</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MSA Approvals</h1>
            <p className="text-muted-foreground">
              Review and approve Master Service Agreements
            </p>
          </div>
          {msas && msas.length > 0 && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {msas.length} pending {msas.length === 1 ? 'approval' : 'approvals'}
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Failed to load MSA approvals</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && msas?.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground max-w-md">
                  You have no pending MSA approvals at this time. New agreements will
                  appear here when they need your review.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MSA List */}
        {!isLoading && !error && msas && msas.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {msas.map((msa) => (
              <Card
                key={msa.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenMSA(msa)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{msa.msaNumber}</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-1">{msa.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Parties */}
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {user.userType === 'BEDRIJF'
                          ? msa.bureauName
                          : msa.companyName}
                      </span>
                    </div>

                    {/* Effective Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Effective {format(new Date(msa.effectiveDate), 'dd MMM yyyy')}
                      </span>
                    </div>

                    {/* Approval Status */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Company:</span>
                        <Badge
                          variant={msa.companyApprovedAt ? 'default' : 'outline'}
                          className={
                            msa.companyApprovedAt
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'border-amber-500 text-amber-600'
                          }
                        >
                          {msa.companyApprovedAt ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span className="text-muted-foreground">Bureau:</span>
                        <Badge
                          variant={msa.bureauApprovedAt ? 'default' : 'outline'}
                          className={
                            msa.bureauApprovedAt
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'border-amber-500 text-amber-600'
                          }
                        >
                          {msa.bureauApprovedAt ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full mt-2" size="sm">
                      Review MSA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MSA Approval Modal */}
      <MSAApprovalModal
        msa={selectedMSA}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        userType={user.userType as 'BEDRIJF' | 'BUREAU'}
      />
    </PageWrapper>
  );
}
