import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyAnalytics {
  propertyId: string;
  maintenanceMetrics: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    urgent: number;
    avgCompletionDays: number;
    avgCost: number;
  };
  financialMetrics: {
    monthlyRent: number;
    totalExpenses: number;
    netIncome: number;
    occupancyRate: number;
  };
  checkMetrics: {
    lastCheckDate: string | null;
    nextCheckDate: string | null;
    totalChecks: number;
    issuesFound: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { propertyIds } = await req.json();

    if (!propertyIds || !Array.isArray(propertyIds)) {
      return new Response(
        JSON.stringify({ error: 'Invalid propertyIds array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calculating analytics for properties:', propertyIds);

    // Fetch all data in parallel for better performance
    const [maintenanceData, propertyData, checkSessionData] = await Promise.all([
      supabase
        .from('maintenance_requests')
        .select('*')
        .in('property_id', propertyIds),
      supabase
        .from('properties')
        .select('id, monthly_rent, status')
        .in('id', propertyIds),
      supabase
        .from('property_check_sessions')
        .select('*')
        .in('property_id', propertyIds.map(id => id.toString()))
    ]);

    if (maintenanceData.error) throw maintenanceData.error;
    if (propertyData.error) throw propertyData.error;
    if (checkSessionData.error) throw checkSessionData.error;

    const analytics: PropertyAnalytics[] = propertyIds.map(propertyId => {
      // Maintenance metrics
      const propertyMaintenance = maintenanceData.data?.filter(m => m.property_id === propertyId) || [];
      const completedMaintenance = propertyMaintenance.filter(m => m.status === 'completed');
      
      const avgCompletionDays = completedMaintenance.length > 0
        ? completedMaintenance.reduce((sum, m) => {
            if (m.completed_at && m.created_at) {
              const days = (new Date(m.completed_at).getTime() - new Date(m.created_at).getTime()) / (1000 * 60 * 60 * 24);
              return sum + days;
            }
            return sum;
          }, 0) / completedMaintenance.length
        : 0;

      const avgCost = completedMaintenance.length > 0
        ? completedMaintenance.reduce((sum, m) => sum + (m.actual_cost || 0), 0) / completedMaintenance.length
        : 0;

      // Property financial metrics
      const property = propertyData.data?.find(p => p.id === propertyId);
      const monthlyRent = property?.monthly_rent || 0;
      const occupancyRate = property?.status === 'active' ? 100 : 0;

      // Calculate total expenses from maintenance
      const totalExpenses = propertyMaintenance.reduce((sum, m) => sum + (m.actual_cost || m.estimated_cost || 0), 0);
      const netIncome = (monthlyRent * 12) - totalExpenses;

      // Check session metrics
      const propertySessions = checkSessionData.data?.filter(s => s.property_id === propertyId.toString()) || [];
      const completedSessions = propertySessions.filter(s => s.completed_at);
      const scheduledSessions = propertySessions.filter(s => s.scheduled_date && !s.completed_at);

      const lastCompletedSession = completedSessions.length > 0
        ? completedSessions.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]
        : null;

      const nextScheduledSession = scheduledSessions.length > 0
        ? scheduledSessions.sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())[0]
        : null;

      const issuesFound = propertySessions.reduce((sum, session) => {
        const data = session.checklist_data as any;
        return sum + (data?.total_issues_found || 0);
      }, 0);

      return {
        propertyId,
        maintenanceMetrics: {
          total: propertyMaintenance.length,
          pending: propertyMaintenance.filter(m => m.status === 'pending').length,
          inProgress: propertyMaintenance.filter(m => m.status === 'in-progress').length,
          completed: completedMaintenance.length,
          urgent: propertyMaintenance.filter(m => m.priority === 'urgent').length,
          avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
          avgCost: Math.round(avgCost * 100) / 100,
        },
        financialMetrics: {
          monthlyRent,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          netIncome: Math.round(netIncome * 100) / 100,
          occupancyRate,
        },
        checkMetrics: {
          lastCheckDate: lastCompletedSession?.completed_at || null,
          nextCheckDate: nextScheduledSession?.scheduled_date || null,
          totalChecks: completedSessions.length,
          issuesFound,
        },
      };
    });

    console.log('Analytics calculated successfully for', analytics.length, 'properties');

    return new Response(
      JSON.stringify({ analytics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
