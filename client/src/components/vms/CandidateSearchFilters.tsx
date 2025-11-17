import React from 'react';
import { useTranslation } from 'react-i18next';

interface CandidateSearchFiltersProps {
  filters: {
    skills: string[];
    location: string;
    experience: string;
    availability: string;
    minSalary: number | null;
    maxSalary: number | null;
    minHourlyRate: number | null;
    maxHourlyRate: number | null;
  };
  onChange: (filters: any) => void;
  onReset: () => void;
}

export function CandidateSearchFilters({
  filters,
  onChange,
  onReset,
}: CandidateSearchFiltersProps) {
  const { t } = useTranslation();

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...filters, skills });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">{t('vms.candidateSearch.filters')}</h3>

      {/* Skills */}
      <div>
        <label htmlFor="skills-input" className="block text-sm font-medium text-gray-700 mb-1">
          {t('vms.candidateSearch.skills')}
        </label>
        <input
          id="skills-input"
          type="text"
          placeholder={t('vms.candidateSearch.skillsPlaceholder')}
          value={filters.skills.join(', ')}
          onChange={(e) => handleSkillsChange(e.target.value)}
          aria-describedby="skills-hint"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <p id="skills-hint" className="text-xs text-gray-500 mt-1">
          {t('vms.candidateSearch.skillsHint')}
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location-input" className="block text-sm font-medium text-gray-700 mb-1">
          {t('vms.candidateSearch.location')}
        </label>
        <input
          id="location-input"
          type="text"
          placeholder={t('vms.candidateSearch.locationPlaceholder')}
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Experience Level */}
      <div>
        <label htmlFor="experience-select" className="block text-sm font-medium text-gray-700 mb-1">
          {t('vms.candidateSearch.experience')}
        </label>
        <select
          id="experience-select"
          value={filters.experience}
          onChange={(e) => onChange({ ...filters, experience: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('vms.candidateSearch.allLevels')}</option>
          <option value="JUNIOR">{t('vms.candidateSearch.junior')}</option>
          <option value="MEDIOR">{t('vms.candidateSearch.medior')}</option>
          <option value="SENIOR">{t('vms.candidateSearch.senior')}</option>
          <option value="LEAD">{t('vms.candidateSearch.lead')}</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label htmlFor="availability-select" className="block text-sm font-medium text-gray-700 mb-1">
          {t('vms.candidateSearch.availability')}
        </label>
        <select
          id="availability-select"
          value={filters.availability}
          onChange={(e) => onChange({ ...filters, availability: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('vms.candidateSearch.anyAvailability')}</option>
          <option value="IMMEDIATE">{t('vms.candidateSearch.immediate')}</option>
          <option value="TWO_WEEKS">{t('vms.candidateSearch.twoWeeks')}</option>
          <option value="ONE_MONTH">{t('vms.candidateSearch.oneMonth')}</option>
          <option value="NEGOTIABLE">{t('vms.candidateSearch.negotiable')}</option>
        </select>
      </div>

      {/* Salary Range */}
      <div>
        <label htmlFor="min-salary-input" className="block text-sm font-medium text-gray-700 mb-1">
          {t('vms.candidateSearch.salaryRange')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            id="min-salary-input"
            type="number"
            min="0"
            placeholder={t('vms.candidateSearch.minSalary')}
            value={filters.minSalary || ''}
            onChange={(e) => onChange({
              ...filters,
              minSalary: e.target.value ? parseInt(e.target.value) : null
            })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            id="max-salary-input"
            type="number"
            min="0"
            placeholder={t('vms.candidateSearch.maxSalary')}
            value={filters.maxSalary || ''}
            onChange={(e) => onChange({
              ...filters,
              maxSalary: e.target.value ? parseInt(e.target.value) : null
            })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Hourly Rate Range */}
      <div>
        <label htmlFor="min-rate-input" className="block text-sm font-medium text-gray-700 mb-1">
          {t('vms.candidateSearch.hourlyRateRange')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            id="min-rate-input"
            type="number"
            min="0"
            placeholder={t('vms.candidateSearch.minRate')}
            value={filters.minHourlyRate || ''}
            onChange={(e) => onChange({
              ...filters,
              minHourlyRate: e.target.value ? parseInt(e.target.value) : null
            })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            id="max-rate-input"
            type="number"
            min="0"
            placeholder={t('vms.candidateSearch.maxRate')}
            value={filters.maxHourlyRate || ''}
            onChange={(e) => onChange({
              ...filters,
              maxHourlyRate: e.target.value ? parseInt(e.target.value) : null
            })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onReset}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {t('vms.candidateSearch.resetFilters')}
        </button>
      </div>
    </div>
  );
}
