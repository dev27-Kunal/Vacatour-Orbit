// Main types export file for design mode

export * from './database.generated';
export * from './budget';
export * from './contract';
export * from './contracts';
export * from './vms';
export * from './vms-contracts';
export * from './workflow';

// Re-export common types
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

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  salary?: number;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  remote: boolean;
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resume?: string;
  createdAt: Date;
  updatedAt: Date;
}