import { z } from 'zod';

// Input validation schemas
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required');

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .optional();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters');

export const addressSchema = z.string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must be less than 200 characters');

export const zipCodeSchema = z.string()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format');

export const currencySchema = z.number()
  .min(0, 'Amount must be positive')
  .max(1000000, 'Amount exceeds maximum allowed');

// Sanitization functions
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return {
    isAllowed: (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier);

      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (userAttempts.count >= maxAttempts) {
        return false;
      }

      userAttempts.count++;
      return true;
    },
    getRemainingAttempts: (identifier: string): number => {
      const userAttempts = attempts.get(identifier);
      if (!userAttempts || Date.now() > userAttempts.resetTime) {
        return maxAttempts;
      }
      return Math.max(0, maxAttempts - userAttempts.count);
    }
  };
};

// CSRF token helper
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Enhanced form validation helper
export const validateFormField = (fieldName: string, value: any): { isValid: boolean; error?: string } => {
  try {
    switch (fieldName) {
      case 'email':
        emailSchema.parse(value);
        break;
      case 'phone':
        phoneSchema.parse(value);
        break;
      case 'password':
        passwordSchema.parse(value);
        break;
      case 'firstName':
      case 'lastName':
        nameSchema.parse(value);
        break;
      case 'address':
        addressSchema.parse(value);
        break;
      case 'zipCode':
        zipCodeSchema.parse(value);
        break;
      default:
        return { isValid: true };
    }
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: 'Invalid input' };
  }
};

// Secure password generation for temporary passwords
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};