import { z } from 'zod';

/**
 * Security-focused input validation schemas
 * All user inputs MUST be validated using these schemas
 */

// Common field validators
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" })
  .toLowerCase();

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s\-\+\(\)]+$/, { message: "Invalid phone number format" })
  .min(10, { message: "Phone number must be at least 10 digits" })
  .max(20, { message: "Phone number must be less than 20 characters" });

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s\-'\.]+$/, { message: "Name contains invalid characters" });

export const addressSchema = z
  .string()
  .trim()
  .min(1, { message: "Address cannot be empty" })
  .max(255, { message: "Address must be less than 255 characters" });

export const zipCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code format" })
  .max(10);

export const currencySchema = z
  .number()
  .nonnegative({ message: "Amount must be positive" })
  .finite()
  .max(999999999.99, { message: "Amount too large" });

export const percentageSchema = z
  .number()
  .min(0, { message: "Percentage must be between 0 and 100" })
  .max(100, { message: "Percentage must be between 0 and 100" });

// Property validation
export const propertySchema = z.object({
  address: addressSchema,
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().length(2, { message: "State must be 2 characters" }).toUpperCase(),
  zip_code: zipCodeSchema,
  property_type: z.enum(['single_family', 'condo', 'townhouse', 'duplex', 'multi_family', 'apartment', 'commercial']),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().min(0).max(50).optional(),
  square_feet: z.number().int().min(0).max(999999).optional(),
  rent_amount: currencySchema.optional(),
  purchase_price: currencySchema.optional(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  description: z.string().max(2000, { message: "Description too long" }).optional(),
});

// Tenant validation
export const tenantSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  move_in_date: z.string().datetime().optional(),
  move_out_date: z.string().datetime().optional(),
  lease_start: z.string().datetime().optional(),
  lease_end: z.string().datetime().optional(),
  rent_amount: currencySchema.optional(),
  security_deposit: currencySchema.optional(),
  emergency_contact_name: nameSchema.optional(),
  emergency_contact_phone: phoneSchema.optional(),
});

// Maintenance request validation
export const maintenanceRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().trim().min(1).max(50).optional(),
  estimated_cost: currencySchema.optional(),
  scheduled_date: z.string().datetime().optional(),
});

// Vendor validation
export const vendorSchema = z.object({
  business_name: z.string().trim().min(1).max(200),
  contact_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema.optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().length(2).toUpperCase().optional(),
  zip_code: zipCodeSchema.optional(),
  category: z.string().trim().min(1).max(50),
  license_number: z.string().trim().max(100).optional(),
  hourly_rate: currencySchema.optional(),
  notes: z.string().max(1000).optional(),
});

// Message validation (prevent injection attacks)
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(5000, { message: "Message too long (max 5000 characters)" })
    .refine(
      (val) => !/<script|javascript:|onerror=|onclick=/i.test(val),
      { message: "Message contains forbidden content" }
    ),
  subject: z
    .string()
    .trim()
    .max(200, { message: "Subject too long" })
    .optional(),
});

// Document upload validation
export const documentUploadSchema = z.object({
  file_name: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine(
      (val) => !/[<>:"|?*\\\/]/.test(val),
      { message: "File name contains invalid characters" }
    ),
  category: z.enum(['general', 'contracts', 'invoices', 'reports', 'photos', 'maintenance', 'legal']),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().trim().max(50)).max(20).optional(),
});

// User profile validation
export const profileSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema.optional(),
  company_name: z.string().trim().max(200).optional(),
  address: addressSchema.optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().length(2).toUpperCase().optional(),
  zip_code: zipCodeSchema.optional(),
});

/**
 * Sanitize HTML to prevent XSS attacks
 * Use this before displaying any user-generated content as HTML
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate and sanitize URL parameters
 */
export function sanitizeUrlParam(param: string): string {
  return encodeURIComponent(param.trim());
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
): { valid: boolean; error?: string } {
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return file.type.startsWith(category + '/');
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check for potentially malicious file names
  if (/[<>:"|?*\\\/]/.test(file.name)) {
    return { valid: false, error: 'File name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Rate limiting helper (client-side)
 * Use to prevent spam and abuse
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  check(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();