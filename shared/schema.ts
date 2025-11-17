// Mock schema for design mode
// In production, these come from the backend

import { z } from 'zod';

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['company', 'freelancer', 'bureau']),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['company', 'freelancer', 'bureau']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Job schemas
export const jobSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.number().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  remote: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  salary: z.number().positive().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  remote: z.boolean(),
});

// Application schemas
export const applicationSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  coverLetter: z.string().optional(),
  resume: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Message schemas
export const messageSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  content: z.string(),
  read: z.boolean(),
  createdAt: z.date(),
});

// Profile schemas
export const profileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    description: z.string().optional(),
  })),
  education: z.array(z.object({
    degree: z.string(),
    school: z.string(),
    year: z.number(),
  })),
  portfolio: z.array(z.string().url()).optional(),
});

// Export type inference helpers
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type User = z.infer<typeof userSchema>;
export type Job = z.infer<typeof jobSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Profile = z.infer<typeof profileSchema>;