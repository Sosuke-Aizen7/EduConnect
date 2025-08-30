import { z } from 'zod';
// Use a simple text sanitizer instead of DOMPurify for better compatibility
// import DOMPurify from 'isomorphic-dompurify';

/**
 * Validation schemas for scraped data
 */

// University validation schema
export const scrapedUniversitySchema = z.object({
  name: z.string()
    .min(2, 'University name must be at least 2 characters')
    .max(200, 'University name must be less than 200 characters')
    .refine(val => !/\d{4,}/.test(val), 'University name should not contain long number sequences'),
  
  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must be less than 100 characters')
    .refine(val => /^[a-zA-Z\s\-\.]+$/.test(val), 'Country name should only contain letters, spaces, hyphens, and periods'),
  
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .refine(val => /^[a-zA-Z\s\-\.]+$/.test(val), 'City name should only contain letters, spaces, hyphens, and periods'),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  website: z.string()
    .url('Website must be a valid URL')
    .refine(val => val.startsWith('http'), 'Website must start with http or https'),
  
  imageUrl: z.string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  ranking: z.number()
    .int('Ranking must be an integer')
    .min(1, 'Ranking must be at least 1')
    .max(10000, 'Ranking must be less than 10000')
    .optional(),
  
  established: z.number()
    .int('Establishment year must be an integer')
    .min(800, 'Establishment year seems too early')
    .max(new Date().getFullYear(), 'Establishment year cannot be in the future')
    .optional()
});

// Course validation schema
export const scrapedCourseSchema = z.object({
  title: z.string()
    .min(3, 'Course title must be at least 3 characters')
    .max(200, 'Course title must be less than 200 characters')
    .refine(val => val.trim().length > 0, 'Course title cannot be empty or whitespace only'),
  
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  
  level: z.enum(["Bachelor's", "Master's", "PhD", "Certificate"], {
    errorMap: () => ({ message: 'Level must be one of: Bachelor\'s, Master\'s, PhD, Certificate' })
  }),
  
  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(100, 'Subject must be less than 100 characters')
    .refine(val => /^[a-zA-Z\s\-&]+$/.test(val), 'Subject should only contain letters, spaces, hyphens, and ampersands'),
  
  duration: z.string()
    .min(1, 'Duration is required')
    .max(50, 'Duration must be less than 50 characters')
    .refine(val => /\d+\s*(year|month|week)s?/i.test(val), 'Duration must include time period (years, months, or weeks)'),
  
  format: z.enum(['On-campus', 'Online', 'Hybrid'], {
    errorMap: () => ({ message: 'Format must be one of: On-campus, Online, Hybrid' })
  }),
  
  fees: z.number()
    .min(0, 'Fees cannot be negative')
    .max(1000000, 'Fees seem unreasonably high')
    .optional(),
  
  feesType: z.enum(['total', 'yearly', 'monthly', 'per_credit'], {
    errorMap: () => ({ message: 'Fee type must be one of: total, yearly, monthly, per_credit' })
  }).optional(),
  
  requirements: z.string()
    .max(2000, 'Requirements must be less than 2000 characters')
    .optional(),
  
  imageUrl: z.string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  applicationDeadline: z.date()
    .min(new Date(), 'Application deadline cannot be in the past')
    .optional(),
  
  startDate: z.date()
    .optional()
});

/**
 * Text sanitization utilities
 */
export class DataSanitizer {
  
  /**
   * Sanitizes HTML content and removes dangerous elements
   */
  static sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    
    // Simple HTML sanitization - strip all HTML tags and dangerous content
    return html
      // Remove script tags and content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      // Remove style tags and content
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Sanitizes plain text by removing potentially dangerous content
   */
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    return text
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove script content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      // Remove style content
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Trim
      .trim();
  }
  
  /**
   * Sanitizes URLs and validates format
   */
  static sanitizeUrl(url: string): string | undefined {
    if (!url || typeof url !== 'string') return undefined;
    
    try {
      // Remove potentially dangerous characters
      const cleaned = url.replace(/[<>"']/g, '');
      
      // Validate URL format
      const urlObj = new URL(cleaned);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return undefined;
      }
      
      return urlObj.toString();
    } catch {
      return undefined;
    }
  }
  
  /**
   * Extracts and normalizes numeric values
   */
  static extractNumber(text: string, defaultValue?: number): number | undefined {
    if (!text || typeof text !== 'string') return defaultValue;
    
    // Remove currency symbols and commas
    const cleaned = text.replace(/[£$€,\s]/g, '');
    
    // Extract first number found
    const match = cleaned.match(/(\d+(?:\.\d{1,2})?)/);
    if (match) {
      const num = parseFloat(match[1]);
      return isNaN(num) ? defaultValue : num;
    }
    
    return defaultValue;
  }
  
  /**
   * Normalizes date strings to Date objects
   */
  static parseDate(dateStr: string): Date | undefined {
    if (!dateStr || typeof dateStr !== 'string') return undefined;
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid and not too far in past/future
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 10, 0, 1); // 10 years ago
      const maxDate = new Date(now.getFullYear() + 10, 11, 31); // 10 years from now
      
      if (date >= minDate && date <= maxDate) {
        return date;
      }
    } catch {
      // Date parsing failed
    }
    
    return undefined;
  }
}

/**
 * Main validation class for scraped data
 */
export class ScrapedDataValidator {
  
  /**
   * Validates and sanitizes university data
   */
  static validateUniversity(rawData: any): {
    isValid: boolean;
    data?: any;
    errors?: string[];
  } {
    const errors: string[] = [];
    
    try {
      // Sanitize inputs first
      const sanitizedData = {
        name: DataSanitizer.sanitizeText(rawData.name || ''),
        country: DataSanitizer.sanitizeText(rawData.country || ''),
        city: DataSanitizer.sanitizeText(rawData.city || ''),
        description: DataSanitizer.sanitizeText(rawData.description || ''),
        website: DataSanitizer.sanitizeUrl(rawData.website || ''),
        imageUrl: DataSanitizer.sanitizeUrl(rawData.imageUrl || ''),
        ranking: DataSanitizer.extractNumber(rawData.ranking?.toString() || ''),
        established: DataSanitizer.extractNumber(rawData.established?.toString() || ''),
      };
      
      // Validate using schema
      const result = scrapedUniversitySchema.safeParse(sanitizedData);
      
      if (result.success) {
        return {
          isValid: true,
          data: result.data
        };
      } else {
        const validationErrors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return {
          isValid: false,
          errors: validationErrors
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error}`]
      };
    }
  }
  
  /**
   * Validates and sanitizes course data
   */
  static validateCourse(rawData: any): {
    isValid: boolean;
    data?: any;
    errors?: string[];
  } {
    try {
      // Sanitize inputs first
      const sanitizedData = {
        title: DataSanitizer.sanitizeText(rawData.title || ''),
        description: DataSanitizer.sanitizeText(rawData.description || ''),
        level: rawData.level,
        subject: DataSanitizer.sanitizeText(rawData.subject || ''),
        duration: DataSanitizer.sanitizeText(rawData.duration || ''),
        format: rawData.format || 'On-campus',
        fees: DataSanitizer.extractNumber(rawData.fees?.toString() || ''),
        feesType: rawData.feesType || 'yearly',
        requirements: DataSanitizer.sanitizeText(rawData.requirements || ''),
        imageUrl: DataSanitizer.sanitizeUrl(rawData.imageUrl || ''),
        applicationDeadline: DataSanitizer.parseDate(rawData.applicationDeadline),
        startDate: DataSanitizer.parseDate(rawData.startDate),
      };
      
      // Validate using schema
      const result = scrapedCourseSchema.safeParse(sanitizedData);
      
      if (result.success) {
        return {
          isValid: true,
          data: result.data
        };
      } else {
        const validationErrors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return {
          isValid: false,
          errors: validationErrors
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error}`]
      };
    }
  }
  
  /**
   * Batch validates multiple course records
   */
  static validateCourses(rawCourses: any[]): {
    valid: any[];
    invalid: { data: any; errors: string[] }[];
    stats: { total: number; valid: number; invalid: number };
  } {
    const valid: any[] = [];
    const invalid: { data: any; errors: string[] }[] = [];
    
    for (const rawCourse of rawCourses) {
      const validation = this.validateCourse(rawCourse);
      
      if (validation.isValid && validation.data) {
        valid.push(validation.data);
      } else {
        invalid.push({
          data: rawCourse,
          errors: validation.errors || ['Unknown validation error']
        });
      }
    }
    
    return {
      valid,
      invalid,
      stats: {
        total: rawCourses.length,
        valid: valid.length,
        invalid: invalid.length
      }
    };
  }
}

// Export types
export type ValidatedUniversityData = z.infer<typeof scrapedUniversitySchema>;
export type ValidatedCourseData = z.infer<typeof scrapedCourseSchema>;