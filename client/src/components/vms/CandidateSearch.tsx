import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CandidateSearchFilters } from './CandidateSearchFilters';
import { CandidateSearchResults } from './CandidateSearchResults';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function CandidateSearch() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: '',
    experience: '',
    availability: '',
    minSalary: null as number | null,
    maxSalary: null as number | null,
    minHourlyRate: null as number | null,
    maxHourlyRate: null as number | null,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFeatures, setUserFeatures] = useState<string[]>([]);
  const [userType, setUserType] = useState<string>('');

  // Search function
  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('session_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Build query params
      const params = new URLSearchParams();
      if (filters.skills.length > 0) {params.set('skills', filters.skills.join(','));}
      if (filters.location) {params.set('location', filters.location);}
      if (filters.experience) {params.set('experience', filters.experience);}
      if (filters.availability) {params.set('availability', filters.availability);}
      if (filters.minSalary) {params.set('minSalary', filters.minSalary.toString());}
      if (filters.maxSalary) {params.set('maxSalary', filters.maxSalary.toString());}
      if (filters.minHourlyRate) {params.set('minHourlyRate', filters.minHourlyRate.toString());}
      if (filters.maxHourlyRate) {params.set('maxHourlyRate', filters.maxHourlyRate.toString());}
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());

      const response = await fetch(`${API_URL}/api/vms/candidates/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile to check features
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('session_token');
        if (!token) {return;}

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setUserFeatures(data.data.features || []);
          setUserType(data.data.userType);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    };

    fetchUserProfile();
  }, []);

  // Search on filter/page changes with debouncing
  useEffect(() => {
    const timer = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(timer);
  }, [JSON.stringify(filters), page, pageSize]);

  const handleResetFilters = () => {
    setFilters({
      skills: [],
      location: '',
      experience: '',
      availability: '',
      minSalary: null,
      maxSalary: null,
      minHourlyRate: null,
      maxHourlyRate: null,
    });
    setPage(1);
  };

  const handleCandidateClick = (candidate: any) => {
    // TODO: Navigate to candidate detail page or open modal
    console.log('Selected candidate:', candidate);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  const hasPremiumAccess = userFeatures.includes('PREMIUM_CANDIDATE_ACCESS');
  const isCompany = userType === 'BEDRIJF';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('vms.candidateSearch.title')}</h1>

      {/* Premium Upgrade Banner (for companies without premium) */}
      {isCompany && !hasPremiumAccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                {t('vms.candidateSearch.upgradeTitle')}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {t('vms.candidateSearch.upgradeDescription')}
              </p>
              <ul className="mt-2 text-sm text-blue-600 space-y-1">
                <li>{t('vms.candidateSearch.feature1')}</li>
                <li>{t('vms.candidateSearch.feature2')}</li>
                <li>{t('vms.candidateSearch.feature3')}</li>
              </ul>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap">
              {t('vms.candidateSearch.upgradeButton')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <CandidateSearchFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {results && (
            <CandidateSearchResults
              results={results.results}
              total={results.total}
              page={results.page}
              pageSize={results.pageSize}
              totalPages={results.totalPages}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              onCandidateClick={handleCandidateClick}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
