import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HomeCheckTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'home_check' | 'property_check';
  is_active: boolean;
  sections?: HomeCheckTemplateSection[];
}

export interface HomeCheckTemplateSection {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  sort_order: number;
  items?: HomeCheckTemplateItem[];
}

export interface HomeCheckTemplateItem {
  id: string;
  section_id: string;
  item_text: string;
  is_required: boolean;
  sort_order: number;
}

export const useHomeCheckTemplates = () => {
  const [templates, setTemplates] = useState<HomeCheckTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchActiveTemplate = useCallback(async (): Promise<HomeCheckTemplate | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('check_templates')
        .select(`
          *,
          sections:check_template_sections(
            *,
            items:check_template_items(*)
          )
        `)
        .eq('type', 'home_check')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - this is expected if no template exists
          return null;
        }
        throw error;
      }

      return data as HomeCheckTemplate;
    } catch (error) {
      console.error('Error fetching home check template:', error);
      toast({
        title: "Error loading template",
        description: "Failed to load home check template. Using default checklist.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchAllTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('check_templates')
        .select(`
          *,
          sections:check_template_sections(
            *,
            items:check_template_items(*)
          )
        `)
        .eq('type', 'home_check')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data as HomeCheckTemplate[] || []);
      return data as HomeCheckTemplate[] || [];
    } catch (error) {
      console.error('Error fetching home check templates:', error);
      toast({
        title: "Error loading templates",
        description: "Failed to load home check templates.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    templates,
    isLoading,
    fetchActiveTemplate,
    fetchAllTemplates
  };
};