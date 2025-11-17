import type { JobDistributionPreferences, UpdateJobDistributionPreferences } from "@shared/schema";

// Re-export shared types for consistency
export type { JobDistributionPreferences, UpdateJobDistributionPreferences } from "@shared/schema";

// Frontend-specific types for the job alerts preferences
export interface JobAlertFormData {
  emailEnabled: boolean;
  vastJobsEnabled: boolean;
  interimJobsEnabled: boolean;
  uitzendenjobsEnabled: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly';
  locationRadius: number;
  preferredLocations: string[];
}

// API response type
export interface JobAlertPreferencesResponse {
  success: boolean;
  data: JobDistributionPreferences;
  message?: string;
}

// API error type
export interface JobAlertPreferencesError {
  success: false;
  message: string;
  validationErrors?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

// Loading states for the component
export interface JobAlertPreferencesState {
  isLoading: boolean;
  isSaving: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

// Form field identifiers for type safety
export type JobAlertFieldName = keyof JobAlertFormData;