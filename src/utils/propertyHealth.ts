import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;
type MaintenanceRequest = Tables<'maintenance_requests'>;

export interface PropertyHealthMetrics {
  score: number; // 0-100
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  issues: string[];
  recommendations: string[];
}

/**
 * Calculate property health score based on various factors
 * @param property - The property to analyze
 * @param maintenanceRequests - Recent maintenance requests for the property
 * @param lastInspectionDate - Date of last inspection (optional)
 * @returns PropertyHealthMetrics object with score, rating, and recommendations
 */
export function calculatePropertyHealth(
  property: Property,
  maintenanceRequests: MaintenanceRequest[] = [],
  lastInspectionDate?: Date
): PropertyHealthMetrics {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Factor 1: Property Age (max -15 points)
  if (property.year_built) {
    const age = new Date().getFullYear() - property.year_built;
    if (age > 50) {
      score -= 15;
      issues.push('Property is over 50 years old');
      recommendations.push('Consider comprehensive inspection and modernization');
    } else if (age > 30) {
      score -= 10;
      issues.push('Property is over 30 years old');
      recommendations.push('Schedule regular inspections for aging components');
    } else if (age > 15) {
      score -= 5;
      issues.push('Property requires routine maintenance');
    }
  }

  // Factor 2: Maintenance Request Frequency (max -30 points)
  const urgentRequests = maintenanceRequests.filter(r => r.priority === 'urgent' && r.status !== 'completed');
  const highRequests = maintenanceRequests.filter(r => r.priority === 'high' && r.status !== 'completed');
  const openRequests = maintenanceRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');

  if (urgentRequests.length > 0) {
    score -= 20;
    issues.push(`${urgentRequests.length} urgent maintenance issue(s)`);
    recommendations.push('Address urgent maintenance immediately');
  }

  if (highRequests.length > 2) {
    score -= 10;
    issues.push(`${highRequests.length} high-priority maintenance issues`);
    recommendations.push('Schedule high-priority repairs within 7 days');
  }

  if (openRequests.length > 5) {
    score -= 10;
    issues.push(`${openRequests.length} open maintenance requests`);
    recommendations.push('Review and prioritize pending maintenance');
  }

  // Factor 3: Last Inspection Date (max -25 points)
  if (lastInspectionDate) {
    const daysSinceInspection = Math.floor(
      (Date.now() - lastInspectionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceInspection > 365) {
      score -= 25;
      issues.push('No inspection in over a year');
      recommendations.push('Schedule comprehensive property inspection');
    } else if (daysSinceInspection > 180) {
      score -= 15;
      issues.push('Inspection overdue (6+ months)');
      recommendations.push('Schedule routine inspection');
    } else if (daysSinceInspection > 90) {
      score -= 5;
      issues.push('Inspection due soon');
    }
  } else {
    score -= 20;
    issues.push('No inspection records found');
    recommendations.push('Schedule initial property inspection');
  }

  // Factor 4: Property Status (max -20 points)
  if (property.status === 'maintenance') {
    score -= 15;
    issues.push('Property currently under maintenance');
  } else if (property.status === 'inactive') {
    score -= 10;
    issues.push('Property marked as inactive');
  }

  // Ensure score stays within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine rating and color
  let rating: PropertyHealthMetrics['rating'];
  let color: string;

  if (score >= 85) {
    rating = 'excellent';
    color = 'text-success';
  } else if (score >= 70) {
    rating = 'good';
    color = 'text-primary';
  } else if (score >= 50) {
    rating = 'fair';
    color = 'text-warning';
  } else {
    rating = 'poor';
    color = 'text-destructive';
  }

  // Add positive recommendations if score is good
  if (score >= 85 && issues.length === 0) {
    recommendations.push('Property is in excellent condition - maintain current care routine');
  }

  return {
    score,
    rating,
    color,
    issues,
    recommendations
  };
}
