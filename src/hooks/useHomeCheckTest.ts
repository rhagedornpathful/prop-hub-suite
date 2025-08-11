import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export const useHomeCheckTest = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { userRole, isAdmin } = useUserRole();
  
  const runHomeCheckTests = async () => {
    setIsRunning(true);
    const results: { [key: string]: string } = {};
    
    try {
      // Test 1: Check user permissions
      results.permissions = userRole === 'house_watcher' || isAdmin() ? 'PASS' : 'FAIL - Only house watchers and admins can access';
      
      // Test 2: Check if templates exist
      const { data: templates, error: templateError } = await supabase
        .from('check_templates')
        .select('*')
        .eq('type', 'home_check')
        .eq('is_active', true);
      
      results.templates = templateError ? `FAIL - ${templateError.message}` : 
        templates?.length > 0 ? 'PASS' : 'FAIL - No active home check templates found';
      
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
      }
      
      // Test 4: Check properties exist
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address')
        .limit(1);
      
      results.properties = propertiesError ? `FAIL - ${propertiesError.message}` :
        properties?.length > 0 ? 'PASS' : 'FAIL - No properties found for testing';
      
      // Test 5: Test session creation (if user has permission)
      if (results.permissions === 'PASS' && properties && properties.length > 0) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user && !userError) {
          const { data: session, error: sessionError } = await supabase
            .from('home_check_sessions')
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
            
            // Clean up test session
            await supabase
              .from('home_check_sessions')
              .delete()
              .eq('id', session.id);
          }
        } else {
          results.sessionCreation = 'FAIL - User not authenticated';
        }
      } else {
        results.sessionCreation = 'SKIPPED - Prerequisites not met';
      }
      
      // Test 6: Test activities logging
      if (results.permissions === 'PASS') {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user && !userError) {
          const { error: activityError } = await supabase
            .from('home_check_activities')
            .insert({
              session_id: '00000000-0000-0000-0000-000000000000', // Test UUID
              user_id: user.id,
              activity_type: 'test',
              activity_data: { test: true }
            });
          
          results.activitiesLogging = activityError ? `FAIL - ${activityError.message}` : 'PASS';
          
          // Clean up test activity
          if (!activityError) {
            await supabase
              .from('home_check_activities')
              .delete()
              .eq('activity_type', 'test')
              .eq('user_id', user.id);
          }
        } else {
          results.activitiesLogging = 'FAIL - User not authenticated';
        }
      } else {
        results.activitiesLogging = 'SKIPPED - No permission';
      }
      
    } catch (error) {
      results.general = `FAIL - ${error}`;
    }
    
    setTestResults(results);
    setIsRunning(false);
    
    // Show summary
    const passCount = Object.values(results).filter(r => r === 'PASS').length;
    const totalTests = Object.values(results).filter(r => !r.startsWith('SKIPPED')).length;
    
    toast({
      title: "Home Check Test Complete",
      description: `${passCount}/${totalTests} tests passed`,
      variant: passCount === totalTests ? "default" : "destructive"
    });
  };
  
  return {
    testResults,
    isRunning,
    runHomeCheckTests
  };
};