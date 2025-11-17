/**
 * Bureau Profile API Client
 *
 * Handles bureau-specific profile data including certifications,
 * work preferences, and company information.
 *
 * @module client/lib/api/bureau-profile
 */

import { apiGet, apiPatch, type ApiResponse } from '@/lib/api-client';
import { z } from 'zod';

// ============================================================================
// Types & Validation Schemas
// ============================================================================

/**
 * Bureau profile data structure
 */
export interface BureauProfile {
  // Service Type
  serviceType: 'W&S' | 'UITZENDEN_DETACHEREN';

  // Certifications (multi-select)
  certifications: {
    nen: boolean;
    waadi: boolean;
  };

  // Work Preferences (multi-select)
  workPreferences: {
    vast: boolean;
    interim: boolean;
    uitzenden: boolean;
  };

  // Company Information (from tenant)
  companyName: string;
  kvkNumber: string;
  notificationEmail: string;
  phone: string;

  // Office Address
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Zod schema for bureau profile validation
 */
export const bureauProfileSchema = z.object({
  serviceType: z.enum(['W&S', 'UITZENDEN_DETACHEREN'], {
    required_error: 'Selecteer een service type',
  }),

  certifications: z.object({
    nen: z.boolean(),
    waadi: z.boolean(),
  }),

  workPreferences: z.object({
    vast: z.boolean(),
    interim: z.boolean(),
    uitzenden: z.boolean(),
  }).refine(
    (prefs) => prefs.vast || prefs.interim || prefs.uitzenden,
    {
      message: 'Selecteer minimaal één werkvoorkeur',
    }
  ),

  companyName: z.string().min(2, 'Bedrijfsnaam moet minimaal 2 karakters zijn'),

  kvkNumber: z.string()
    .regex(/^\d{8}$/, 'KVK nummer moet 8 cijfers zijn')
    .length(8, 'KVK nummer moet exact 8 cijfers zijn'),

  notificationEmail: z.string()
    .email('Ongeldig email adres')
    .min(1, 'Email is verplicht'),

  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Ongeldig telefoonnummer formaat')
    .min(10, 'Telefoonnummer moet minimaal 10 cijfers bevatten'),

  address: z.object({
    street: z.string().min(3, 'Straat moet minimaal 3 karakters zijn'),
    city: z.string().min(2, 'Plaats moet minimaal 2 karakters zijn'),
    postalCode: z.string()
      .regex(/^\d{4}\s?[A-Z]{2}$/i, 'Ongeldige postcode (gebruik formaat: 1234 AB)')
      .transform(val => val.toUpperCase().replace(/\s/g, ' ')),
    country: z.string().default('Nederland'),
  }),
});

export type BureauProfileFormData = z.infer<typeof bureauProfileSchema>;

// ============================================================================
// API Client
// ============================================================================

class BureauProfileApiClient {
  private baseUrl = '/api/bureau/profile';

  /**
   * Get bureau profile data
   */
  async getProfile(): Promise<ApiResponse<BureauProfile>> {
    return apiGet<BureauProfile>(this.baseUrl);
  }

  /**
   * Update bureau profile
   */
  async updateProfile(data: BureauProfileFormData): Promise<ApiResponse<BureauProfile>> {
    // Validate data before sending
    const validated = bureauProfileSchema.parse(data);
    return apiPatch<BureauProfile>(this.baseUrl, validated);
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const bureauProfileApi = new BureauProfileApiClient();

// Export type for use in components
export type { BureauProfileApiClient };
