/**
 * Certification List Component
 *
 * Display list of certifications with filtering and actions
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Upload,
  Download,
  Filter
} from 'lucide-react';
import type { Certification, CertificationStatus } from '@/api/v2/vms/compliance/types';

interface CertificationListProps {
  certifications: Certification[];
  loading?: boolean;
  onView?: (cert: Certification) => void;
  onVerify?: (cert: Certification) => void;
  onUploadDocument?: (cert: Certification) => void;
  canVerify?: boolean;
}

const statusConfig: Record<CertificationStatus, { label: string; color: string; icon: any }> = {
  VERIFIED: { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle },
  EXPIRING_SOON: { label: 'Expiring Soon', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export function CertificationList({
  certifications,
  loading = false,
  onView,
  onVerify,
  onUploadDocument,
  canVerify = false
}: CertificationListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCertifications = certifications.filter((cert) => {
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      cert.certificationType?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) {return '-';}
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="EXPIRING_SOON">Expiring Soon</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certification Type</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Remaining</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No certifications found
                </TableCell>
              </TableRow>
            ) : (
              filteredCertifications.map((cert) => {
                const StatusIcon = statusConfig[cert.status].icon;
                const daysRemaining = getDaysUntilExpiry(cert.expiryDate);

                return (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.certificationType?.displayName || 'Unknown'}
                    </TableCell>
                    <TableCell>{cert.certificationNumber || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[cert.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[cert.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(cert.issueDate)}</TableCell>
                    <TableCell>{formatDate(cert.expiryDate)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          daysRemaining < 0
                            ? 'text-red-600 font-semibold'
                            : daysRemaining < 30
                            ? 'text-orange-600 font-semibold'
                            : 'text-gray-600'
                        }
                      >
                        {daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{cert.documents?.length || 0}</span>
                        {onUploadDocument && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUploadDocument(cert)}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <Button variant="ghost" size="sm" onClick={() => onView(cert)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {canVerify && cert.status === 'PENDING' && onVerify && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onVerify(cert)}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredCertifications.length} of {certifications.length} certifications
        </span>
      </div>
    </div>
  );
}
