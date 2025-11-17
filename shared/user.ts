// Mock user types for design mode

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'company' | 'freelancer' | 'bureau' | 'admin';
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  portfolio?: string[];
  avatar?: string;
  phone?: string;
  location?: string;
}

// Helper function to normalize user type
export function normalizeUserType(role: string): 'company' | 'freelancer' | 'bureau' | 'admin' {
  switch (role?.toLowerCase()) {
    case 'company':
      return 'company';
    case 'freelancer':
    case 'zzp':
      return 'freelancer';
    case 'bureau':
      return 'bureau';
    case 'admin':
      return 'admin';
    default:
      return 'freelancer'; // default
  }
}

// Check if role requires company name
export function requiresCompanyName(role: string): boolean {
  const normalized = normalizeUserType(role);
  return normalized === 'company' || normalized === 'bureau';
}