import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export const usePropertyCheckTest = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { userRole, isAdmin, isPropertyManager } = useUserRole();
  
  const runPropertyCheckTests = async () => {
    setIsRunning(true);
    const results: { [key: string]: string } = {};
    
    try {
      // Test 1: Check user permissions
      results.permissions = (isPropertyManager() || isAdmin()) ? 'PASS' : 'FAIL - Only property managers and admins can access';
      
      // Test 2: Check if property check templates exist
      const { data: templates, error: templateError } = await supabase
        .from('check_templates')
        .select('*')
        .eq('type', 'property_check')
        .eq('is_active', true);
      
      results.templates = templateError ? `FAIL - ${templateError.message}` : 
        templates?.length > 0 ? 'PASS' : 'FAIL - No active property check templates found';
      
      // Test 3: Check template sections and items
      if (templates && templates.length > 0) {
        const { data: templateWithSections, error: sectionsError } = await supabase
          .from('check_templates')
          .select(`
            *,
            sections:check_template_sections(
              *,
              items:check_template_items(*)
            )
          `)
          .eq('id', templates[0].id)
          .single();
        
        results.templateData = sectionsError ? `FAIL - ${sectionsError.message}` :
          templateWithSections?.sections?.length > 0 ? 'PASS' : 'FAIL - Template has no sections';
        
        // Test item count
        const totalItems = templateWithSections?.sections?.reduce((total: number, section: any) => 
          total + (section.items?.length || 0), 0) || 0;
        results.templateItems = totalItems > 0 ? `PASS - ${totalItems} items found` : 'FAIL - No template items found';
      }
      
      // Test 4: Check properties exist
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address')
        .limit(1);
      
      results.properties = propertiesError ? `FAIL - ${propertiesError.message}` :
        properties?.length > 0 ? 'PASS' : 'FAIL - No properties found for testing';
      
      // Test 5: Check existing sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('property_check_sessions')
        .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      results.existingSessions = sessionsError ? `FAIL - ${sessionsError.message}` :
        `PASS - ${sessions?.length || 0} sessions found`;
      
      // Test 6: Test session creation (if user has permission)
      if (results.permissions === 'PASS' && properties && properties.length > 0) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user && !userError) {
          const { data: session, error: sessionError } = await supabase
            .from('property_check_sessions')
            .insert({
              user_id: user.id,
              property_id: properties[0].id,
              status: 'in_progress',
              checklist_data: { test: true },
              started_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (sessionError) {
            results.sessionCreation = `FAIL - ${sessionError.message}`;
          } else {
            results.sessionCreation = 'PASS';
            
            // Test activity logging
            const { error: activityError } = await supabase
              .from('property_check_activities')
              .insert({
                session_id: session.id,
                user_id: user.id,
                activity_type: 'test',
                activity_data: { test: true }
              });
            
            results.activitiesLogging = activityError ? `FAIL - ${activityError.message}` : 'PASS';
            
            // Clean up test data
            await supabase.from('property_check_activities').delete().eq('session_id', session.id);
            await supabase.from('property_check_sessions').delete().eq('id', session.id);
          }
        } else {
          results.sessionCreation = 'FAIL - User not authenticated';
          results.activitiesLogging = 'SKIPPED';
        }
      } else {
        results.sessionCreation = 'SKIPPED - Prerequisites not met';
        results.activitiesLogging = 'SKIPPED';
      }
      
      // Test 7: Check activity table access
      const { data: activities, error: activitiesTableError } = await supabase
        .from('property_check_activities')
        .select('id')
        .limit(1);
      
      results.tableStructure = activitiesTableError ? `FAIL - ${activitiesTableError.message}` :
        'PASS - Property check tables accessible';
      
    } catch (error) {
      results.general = `FAIL - ${error}`;
    }
    
    setTestResults(results);
    setIsRunning(false);
    
    // Show summary
    const passCount = Object.values(results).filter(r => r.startsWith('PASS')).length;
    const totalTests = Object.values(results).filter(r => !r.startsWith('SKIPPED')).length;
    
    toast({
      title: "Property Check Test Complete",
      description: `${passCount}/${totalTests} tests passed`,
      variant: passCount === totalTests ? "default" : "destructive"
    });
  };
  
  return {
    testResults,
    isRunning,
    runPropertyCheckTests
  };
};