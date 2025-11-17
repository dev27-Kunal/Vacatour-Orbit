import React from 'react';
import { useTranslation } from 'react-i18next';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  experience: string;
  availability: string;
  preferredLocations: string[];
  salaryExpectation?: number;
  hourlyRate?: number;
}

interface CandidateSearchResultsProps {
  results: Array<{ candidate: Candidate }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onCandidateClick: (candidate: Candidate) => void;
  loading?: boolean;
}

export function CandidateSearchResults({
  results,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onCandidateClick,
  loading = false,
}: CandidateSearchResultsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('vms.candidateSearch.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          {t('vms.candidateSearch.showingResults', {
            from: (page - 1) * pageSize + 1,
            to: Math.min(page * pageSize, total),
            total,
          })}
        </p>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-sm text-gray-700">
            {t('vms.candidateSearch.perPage')}:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            aria-label={t('vms.candidateSearch.pageSizeLabel')}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-3">
        {results.map(({ candidate }) => (
          <div
            key={candidate.id}
            onClick={() => onCandidateClick(candidate)}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </h3>
                <p className="text-sm text-gray-600">{candidate.email}</p>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {candidate.experience && (
                    <span>
                      📊 {t(`vms.candidateSearch.${candidate.experience.toLowerCase()}`)}
                    </span>
                  )}
                  {candidate.availability && (
                    <span>
                      📅 {t(`vms.candidateSearch.${candidate.availability.toLowerCase()}`)}
                    </span>
                  )}
                  {candidate.preferredLocations && candidate.preferredLocations.length > 0 && (
                    <span>
                      📍 {candidate.preferredLocations.join(', ')}
                    </span>
                  )}
                </div>

                {/* Salary Info */}
                {(candidate.salaryExpectation || candidate.hourlyRate) && (
                  <div className="flex gap-4 mt-2 text-sm text-gray-700">
                    {candidate.salaryExpectation && (
                      <span>💰 €{candidate.salaryExpectation.toLocaleString()}/year</span>
                    )}
                    {candidate.hourlyRate && (
                      <span>⏱️ €{candidate.hourlyRate}/hour</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label={t('vms.candidateSearch.paginationLabel')}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label={t('vms.candidateSearch.previousPage')}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {t('vms.candidateSearch.previous')}
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              const isCurrentPage = page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  aria-label={t('vms.candidateSearch.pageNumber', { number: pageNum })}
                  aria-current={isCurrentPage ? 'page' : undefined}
                  className={`px-3 py-2 border rounded-md ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label={t('vms.candidateSearch.nextPage')}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {t('vms.candidateSearch.next')}
          </button>
        </nav>
      )}
    </div>
  );
}
