/**
 * Bureau Selection Modal Component
 * 
 * Allows companies to select which bureaus should receive a job posting
 * Features:
 * - Search and filter bureaus
 * - View bureau performance metrics
 * - Select distribution tier (EXCLUSIVE/PRIORITY/STANDARD)
 * - Set candidate limits and exclusive periods
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Award, TrendingUp, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiPost, ApiError } from '@/lib/api-client';

interface Bureau {
  id: string;
  name: string;
  specializations: string[];
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  fillRate: number;
  averageResponseTime?: number;
  geographic

Coverage: string[];
}

interface BureauMatch {
  bureau: Bureau;
  matchScore: number;
  matchReasons: string[];
}

interface Distribution {
  bureauId: string;
  tier: 'EXCLUSIVE' | 'PRIORITY' | 'STANDARD';
  maxCandidates?: number;
  exclusiveUntil?: Date;
  notes?: string;
}

interface BureauSelectionModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onDistribute: (distributions: Distribution[]) => Promise<void>;
}

export function BureauSelectionModal({
  open,
  onClose,
  jobId,
  onDistribute,
}: BureauSelectionModalProps) {
  const [matches, setMatches] = useState<BureauMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBureaus, setSelectedBureaus] = useState<Set<string>>(new Set());
  const [distributions, setDistributions] = useState<Map<string, Distribution>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    if (open && jobId && jobId !== 'new') {
      fetchMatchingBureaus();
    }
  }, [open, jobId]);

  const fetchMatchingBureaus = async () => {
    // Prevent API call for new/draft jobs that don't exist yet
    if (!jobId || jobId === 'new') {
      setMatches([]);
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost(`/api/vms/jobs/${jobId}/match-bureaus`, { criteria: {} });
      setMatches(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load matching bureaus',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBureau = (bureauId: string) => {
    const newSelected = new Set(selectedBureaus);
    if (newSelected.has(bureauId)) {
      newSelected.delete(bureauId);
      const newDistributions = new Map(distributions);
      newDistributions.delete(bureauId);
      setDistributions(newDistributions);
    } else {
      newSelected.add(bureauId);
      const newDistributions = new Map(distributions);
      newDistributions.set(bureauId, {
        bureauId,
        tier: 'STANDARD',
      });
      setDistributions(newDistributions);
    }
    setSelectedBureaus(newSelected);
  };

  const updateDistribution = (bureauId: string, updates: Partial<Distribution>) => {
    const newDistributions = new Map(distributions);
    const existing = newDistributions.get(bureauId);
    if (existing) {
      newDistributions.set(bureauId, { ...existing, ...updates });
      setDistributions(newDistributions);
    }
  };

  const handleDistribute = async () => {
    if (selectedBureaus.size === 0) {
      toast({
        title: 'No bureaus selected',
        description: 'Please select at least one bureau',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const distributionList = Array.from(distributions.values());
      await onDistribute(distributionList);
      
      toast({
        title: 'Success',
        description: `Job distributed to ${selectedBureaus.size} bureau(s)`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to distribute job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(
    (match) =>
      match.bureau.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.bureau.specializations.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const tierColors = {
    PLATINUM: 'bg-purple-100 text-purple-800',
    GOLD: 'bg-yellow-100 text-yellow-800',
    SILVER: 'bg-gray-100 text-gray-800',
    BRONZE: 'bg-orange-100 text-orange-800',
    NEW: 'bg-blue-100 text-blue-800',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Bureaus for Job Distribution</DialogTitle>
          <DialogDescription>
            Choose which bureaus should receive this job posting. Bureaus are ranked by their match
            score and performance.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bureaus by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Bureau List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading bureaus...</div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No matching bureaus found</div>
          ) : (
            filteredMatches.map((match) => (
              <div
                key={match.bureau.id}
                className={`border rounded-lg p-4 ${
                  selectedBureaus.has(match.bureau.id) ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedBureaus.has(match.bureau.id)}
                    onCheckedChange={() => toggleBureau(match.bureau.id)}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    {/* Bureau Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{match.bureau.name}</h3>
                        <Badge className={tierColors[match.bureau.performanceTier]}>
                          {match.bureau.performanceTier}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {match.matchScore}% match
                        </Badge>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {match.bureau.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Fill Rate:</span>
                        <span className="font-medium">{match.bureau.fillRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Response:</span>
                        <span className="font-medium">
                          {match.bureau.averageResponseTime
                            ? `${match.bureau.averageResponseTime.toFixed(1)}h`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-600">Coverage:</span>
                        <span className="font-medium">{match.bureau.geographicCoverage.length}</span>
                      </div>
                    </div>

                    {/* Distribution Settings */}
                    {selectedBureaus.has(match.bureau.id) && (
                      <div className="border-t pt-3 space-y-3 bg-white rounded p-3">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Tier Selection */}
                          <div>
                            <Label className="text-xs">Distribution Tier</Label>
                            <Select
                              value={distributions.get(match.bureau.id)?.tier || 'STANDARD'}
                              onValueChange={(value) =>
                                updateDistribution(match.bureau.id, {
                                  tier: value as 'EXCLUSIVE' | 'PRIORITY' | 'STANDARD',
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EXCLUSIVE">Exclusive (First Access)</SelectItem>
                                <SelectItem value="PRIORITY">Priority (Early Access)</SelectItem>
                                <SelectItem value="STANDARD">Standard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Max Candidates */}
                          <div>
                            <Label className="text-xs">Max Candidates (Optional)</Label>
                            <Input
                              type="number"
                              placeholder="No limit"
                              min="1"
                              value={distributions.get(match.bureau.id)?.maxCandidates || ''}
                              onChange={(e) =>
                                updateDistribution(match.bureau.id, {
                                  maxCandidates: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="text-xs">Notes (Optional)</Label>
                          <Input
                            placeholder="Special instructions for this bureau..."
                            value={distributions.get(match.bureau.id)?.notes || ''}
                            onChange={(e) =>
                              updateDistribution(match.bureau.id, { notes: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDistribute} disabled={loading || selectedBureaus.size === 0}>
            {loading
              ? 'Distributing...'
              : `Distribute to ${selectedBureaus.size} Bureau${selectedBureaus.size !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
