/**
 * Distributed Bureaus List Component
 *
 * Displays a table of bureaus that a job has been distributed to,
 * with filtering, sorting, and action capabilities.
 */

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DistributionStatusBadge } from './DistributionStatusBadge';
import { DistributionWithBureau } from '@/lib/api/job-distributions';
import { DistributionStatus } from '@shared/types/vms';
import { Building2, Trash2, RefreshCw } from 'lucide-react';

interface DistributedBureausListProps {
  jobId: string;
  distributions: DistributionWithBureau[];
  onRemove: (bureauId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
}

type SortField = 'name' | 'status' | 'submissions' | 'accepted';
type SortOrder = 'asc' | 'desc';

export function DistributedBureausList({
  jobId,
  distributions,
  onRemove,
  onRefresh,
  isLoading = false,
}: DistributedBureausListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Filter and sort distributions
  const filteredAndSortedDistributions = useMemo(() => {
    let filtered = distributions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let compareResult = 0;

      switch (sortField) {
        case 'name':
          compareResult = a.bureau.name.localeCompare(b.bureau.name);
          break;
        case 'status':
          compareResult = a.status.localeCompare(b.status);
          break;
        case 'submissions':
          compareResult = a.submittedCandidates - b.submittedCandidates;
          break;
        case 'accepted':
          compareResult = a.acceptedCandidates - b.acceptedCandidates;
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return sorted;
  }, [distributions, statusFilter, sortField, sortOrder]);

  const handleRemoveClick = (bureau: { id: string; name: string }) => {
    setSelectedBureau(bureau);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedBureau) return;

    setIsRemoving(true);
    try {
      await onRemove(selectedBureau.id);
      setRemoveDialogOpen(false);
      setSelectedBureau(null);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Empty state
  if (distributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nog geen bureaus toegewezen
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Distribueer deze vacature naar bureaus om kandidaten te ontvangen.
          Klik op de knop hierboven om automatisch te distribueren naar alle
          geschikte bureaus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter op status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="PENDING">In behandeling</SelectItem>
              <SelectItem value="ACTIVE">Actief</SelectItem>
              <SelectItem value="PAUSED">Gepauzeerd</SelectItem>
              <SelectItem value="COMPLETED">Voltooid</SelectItem>
              <SelectItem value="CANCELLED">Geannuleerd</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Vernieuwen
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedDistributions.length} van {distributions.length}{' '}
        bureaus
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                Bureau {getSortIcon('name')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead>Tier</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('submissions')}
              >
                Ingediend {getSortIcon('submissions')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('accepted')}
              >
                Geaccepteerd {getSortIcon('accepted')}
              </TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDistributions.map((distribution) => (
              <TableRow key={distribution.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{distribution.bureau.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {distribution.bureau.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DistributionStatusBadge status={distribution.status} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{distribution.distributionTier}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-semibold">
                    {distribution.submittedCandidates}
                  </div>
                  {distribution.maxCandidates && (
                    <div className="text-xs text-muted-foreground">
                      / {distribution.maxCandidates} max
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {distribution.acceptedCandidates}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveClick({
                          id: distribution.bureauId,
                          name: distribution.bureau.name,
                        })
                      }
                      disabled={distribution.status === 'COMPLETED'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Distributie verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de distributie naar {selectedBureau?.name}{' '}
              wilt verwijderen? Dit bureau zal geen toegang meer hebben tot deze
              vacature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Annuleren
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? 'Verwijderen...' : 'Verwijderen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
