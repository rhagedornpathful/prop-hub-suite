import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any): boolean => {
    const rules = schema[name];
    if (!rules) return true;

    // Required check
    if (rules.required && (!value || value.toString().trim() === '')) {
      setErrors(prev => ({ ...prev, [name]: rules.message || `${name} is required` }));
      return false;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rules.required) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    }

    const stringValue = value.toString();

    // MinLength check
    if (rules.minLength && stringValue.length < rules.minLength) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: rules.message || `${name} must be at least ${rules.minLength} characters` 
      }));
      return false;
    }

    // MaxLength check
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: rules.message || `${name} must be no more than ${rules.maxLength} characters` 
      }));
      return false;
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: rules.message || `${name} format is invalid` 
      }));
      return false;
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: rules.message || `${name} is invalid` 
      }));
      return false;
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    return true;
  }, [schema]);

  const validateAll = useCallback((data: Record<string, any>): boolean => {
    let isValid = true;
    const newErrors: ValidationErrors = {};

    Object.keys(schema).forEach(name => {
      const fieldValid = validateField(name, data[name]);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }, [schema, validateField]);

  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const setTouchedField = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const getFieldProps = useCallback((name: string) => ({
    error: touched[name] ? errors[name] : undefined,
    onBlur: () => setTouchedField(name),
  }), [errors, touched, setTouchedField]);

  return {
    errors,
    touched,
    validateField,
    validateAll,
    clearError,
    clearAllErrors,
    setTouchedField,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
  };
};