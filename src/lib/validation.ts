import { z } from 'zod';

// String validation helpers
const shortString = z.string().max(100, 'Maximum 100 characters allowed');
const mediumString = z.string().max(500, 'Maximum 500 characters allowed');
const longString = z.string().max(2000, 'Maximum 2000 characters allowed');
const urlString = z.string().url('Invalid URL format').max(500, 'URL too long').or(z.literal(''));
const codeString = z.string().max(50000, 'Code snippet too long (max 50KB)');

// Profile validation
const profileSchema = z.object({
  name: shortString,
  title: shortString,
  location: shortString.optional().or(z.literal('')),
  imageUrl: urlString.optional().or(z.literal('')),
  portfolioUrl: urlString.optional().or(z.literal('')),
});

// Experience validation
const experienceSchema = z.object({
  id: z.string().optional(),
  title: shortString,
  company: shortString,
  period: shortString,
  description: longString,
});

// Project validation
const projectSchema = z.object({
  id: z.string().optional(),
  name: shortString,
  description: longString,
  technologies: mediumString,
  url: urlString.optional().or(z.literal('')),
});

// Greatest impact validation
const greatestImpactSchema = z.object({
  id: z.string().optional(),
  title: shortString,
  context: longString,
  outcome: longString.optional().or(z.literal('')),
});

// Style of work validation
const styleOfWorkSchema = z.object({
  id: z.string().optional(),
  question: mediumString,
  selectedAnswer: mediumString,
});

// Framework validation
const frameworkSchema = z.object({
  id: z.string().optional(),
  name: shortString,
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  projectsBuilt: shortString.optional().or(z.literal('')),
});

// Pastime validation
const pastimeSchema = z.object({
  id: z.string().optional(),
  activity: shortString,
  description: longString,
});

// Code showcase validation
const codeShowcaseSchema = z.object({
  id: z.string().optional(),
  fileName: shortString,
  language: shortString,
  repo: shortString.optional().or(z.literal('')),
  url: urlString.optional().or(z.literal('')),
  caption: mediumString.optional().or(z.literal('')),
  code: codeString,
});

// Complete career card data validation
export const careerCardDataSchema = z.object({
  profile: profileSchema,
  experience: z.array(experienceSchema).max(20, 'Maximum 20 experience entries allowed'),
  projects: z.array(projectSchema).max(20, 'Maximum 20 projects allowed'),
  greatestImpacts: z.array(greatestImpactSchema).max(10, 'Maximum 10 impacts allowed'),
  stylesOfWork: z.array(styleOfWorkSchema).max(20, 'Maximum 20 work styles allowed'),
  frameworks: z.array(frameworkSchema).max(30, 'Maximum 30 frameworks allowed'),
  pastimes: z.array(pastimeSchema).max(10, 'Maximum 10 pastimes allowed'),
  codeShowcase: z.array(codeShowcaseSchema).max(10, 'Maximum 10 code snippets allowed'),
});

export type ValidatedCareerCardData = z.infer<typeof careerCardDataSchema>;

// Development-only logger utility
export const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
};
