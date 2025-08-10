import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CheckTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'home_check' | 'property_check';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sections?: CheckTemplateSection[];
}

export interface CheckTemplateSection {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  sort_order: number;
  items?: CheckTemplateItem[];
}

export interface CheckTemplateItem {
  id: string;
  section_id: string;
  item_text: string;
  is_required: boolean;
  sort_order: number;
}

export interface CheckTemplateInsert {
  name: string;
  description?: string;
  type: 'home_check' | 'property_check';
  is_active?: boolean;
}

export interface CheckTemplateSectionInsert {
  template_id: string;
  name: string;
  description?: string;
  sort_order: number;
}

export interface CheckTemplateItemInsert {
  section_id: string;
  item_text: string;
  is_required?: boolean;
  sort_order: number;
}

export const useCheckTemplates = (type?: 'home_check' | 'property_check') => {
  return useQuery({
    queryKey: ['check-templates', type],
    queryFn: async () => {
      let query = supabase
        .from('check_templates')
        .select(`
          *,
          sections:check_template_sections(
            *,
            items:check_template_items(*)
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as CheckTemplate[];
    },
    staleTime: 30000,
  });
};

export const useCheckTemplate = (id: string) => {
  return useQuery({
    queryKey: ['check-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_templates')
        .select(`
          *,
          sections:check_template_sections(
            *,
            items:check_template_items(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as CheckTemplate;
    },
    enabled: !!id,
  });
};

export const useCreateCheckTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: CheckTemplateInsert) => {
      const { data, error } = await supabase
        .from('check_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Template Created",
        description: "Check template has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create check template",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCheckTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<CheckTemplateInsert> 
    }) => {
      const { data, error } = await supabase
        .from('check_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Template Updated",
        description: "Check template has been updated successfully",
      });
    },
  });
};

export const useDeleteCheckTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('check_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Template Deleted",
        description: "Check template has been deleted successfully",
      });
    },
  });
};

export const useCreateCheckTemplateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (section: CheckTemplateSectionInsert) => {
      const { data, error } = await supabase
        .from('check_template_sections')
        .insert(section)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Section Created",
        description: "Template section has been created successfully",
      });
    },
  });
};

export const useCreateCheckTemplateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: CheckTemplateItemInsert) => {
      const { data, error } = await supabase
        .from('check_template_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Item Created",
        description: "Check item has been created successfully",
      });
    },
  });
};