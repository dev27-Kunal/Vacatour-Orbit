/**
 * Bureau Rankings Leaderboard Component
 *
 * Displays top bureaus ranked by performance
 * Features:
 * - Sortable table with performance metrics
 * - Filter by performance tier
 * - Visual indicators for top 3 positions
 * - Pagination support
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiGet, ApiError } from '@/lib/api-client';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface BureauRanking {
  rank: number;
  bureauId: string;
  bureauName: string;
  performanceTier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW';
  performanceScore: number;
  fillRate: number;
  placementsMade: number;
  averageTimeToFill?: number;
  averageResponseTime?: number;
  responseRate: number;
}

type SortField = 'rank' | 'performanceScore' | 'fillRate' | 'placementsMade';
type SortDirection = 'asc' | 'desc';

export function BureauRankingsLeaderboard() {
  const [rankings, setRankings] = useState<BureauRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/vms/bureaus/rankings');
      setRankings(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'Failed to load bureau rankings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const filteredRankings = rankings.filter((ranking) => {
    return tierFilter === 'ALL' || ranking.performanceTier === tierFilter;
  });

  const sortedRankings = [...filteredRankings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || bValue === undefined) {return 0;}

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedRankings.length / pageSize);
  const paginatedRankings = sortedRankings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const tierColors = {
    PLATINUM: 'bg-purple-100 text-purple-800 border-purple-300',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SILVER: 'bg-gray-200 text-gray-800 border-gray-300',
    BRONZE: 'bg-orange-100 text-orange-800 border-orange-300',
    NEW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
        2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
        3: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white',
      };
      return colors[rank as 1 | 2 | 3];
    }
    return 'bg-gray-100 text-gray-700';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Bureau Rankings
            </CardTitle>
            <CardDescription>
              Performance leaderboard showing top recruitment bureaus
            </CardDescription>
          </div>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value="PLATINUM">Platinum</SelectItem>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
              <SelectItem value="BRONZE">Bronze</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading rankings...</p>
          </div>
        ) : paginatedRankings.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rankings available</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Bureau Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('performanceScore')}
                    >
                      <div className="flex items-center">
                        Performance Score
                        <SortIcon field="performanceScore" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('fillRate')}
                    >
                      <div className="flex items-center">
                        Fill Rate
                        <SortIcon field="fillRate" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('placementsMade')}
                    >
                      <div className="flex items-center">
                        Placements
                        <SortIcon field="placementsMade" />
                      </div>
                    </TableHead>
                    <TableHead>Response Rate</TableHead>
                    <TableHead>Avg. Time to Fill</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRankings.map((bureau) => (
                    <TableRow key={bureau.bureauId} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getRankBadge(bureau.rank)}>
                            #{bureau.rank}
                          </Badge>
                          {getRankIcon(bureau.rank)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{bureau.bureauName}</TableCell>
                      <TableCell>
                        <Badge className={tierColors[bureau.performanceTier]} variant="outline">
                          {bureau.performanceTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${bureau.performanceScore}%` }}
                            />
                          </div>
                          <span className="font-medium">{bureau.performanceScore.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={bureau.fillRate >= 70 ? 'text-green-600 font-medium' : ''}>
                          {bureau.fillRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{bureau.placementsMade}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={bureau.responseRate >= 80 ? 'text-green-600 font-medium' : ''}>
                          {bureau.responseRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {bureau.averageTimeToFill
                          ? `${bureau.averageTimeToFill.toFixed(1)} days`
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, sortedRankings.length)} of {sortedRankings.length}{' '}
                  bureaus
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
