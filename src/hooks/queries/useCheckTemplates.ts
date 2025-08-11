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
      try {
        // Try a simple direct query first
        const { data: templates, error: templatesError } = await supabase
          .from('check_templates' as any)
          .select('*')
          .eq('is_active', true);

        if (templatesError) {
          console.error('Templates query error:', templatesError);
          return [];
        }

        console.log('Found templates:', templates);
        
        // Filter by type if specified
        let filteredTemplates = templates || [];
        if (type && filteredTemplates.length > 0) {
          filteredTemplates = filteredTemplates.filter((t: any) => t.type === type);
        }
        
        return filteredTemplates;
      } catch (error) {
        console.error('Error fetching check templates:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 30000,
  });
};

export const useCheckTemplate = (id: string) => {
  return useQuery({
    queryKey: ['check-template', id],
    queryFn: async () => {
      try {
        console.log('Fetching template with ID:', id);
        
        // First get the template
        const { data: template, error: templateError } = await supabase
          .from('check_templates')
          .select('*')
          .eq('id', id)
          .single();
        
        if (templateError) {
          console.error('Error fetching template:', templateError);
          return null;
        }
        
        // Then get sections with items
        const { data: sections, error: sectionsError } = await supabase
          .from('check_template_sections')
          .select(`
            *,
            items:check_template_items(*)
          `)
          .eq('template_id', id)
          .order('sort_order');
        
        if (sectionsError) {
          console.error('Error fetching sections:', sectionsError);
        }
        
        const result = {
          ...template,
          sections: sections || []
        };
        
        console.log('Fetched template data:', result);
        return result;
      } catch (error) {
        console.error('Check template fetch error:', error);
        return null;
      }
    },
    enabled: !!id,
  });
};

export const useCreateCheckTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: CheckTemplateInsert) => {
      try {
        const { data, error } = await supabase
          .from('check_templates' as any)
          .insert(template)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Create template error:', error);
        throw error;
      }
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
      try {
        const { data, error } = await supabase
          .from('check_templates' as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Update template error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      queryClient.invalidateQueries({ queryKey: ['check-template'] });
      toast({
        title: "Template Updated",
        description: "Check template has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update template error:', error);
      toast({
        title: "Error",
        description: "Failed to update check template",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCheckTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('check_templates' as any)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Delete template error:', error);
        throw error;
      }
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
      try {
        const { data, error } = await supabase
          .from('check_template_sections' as any)
          .insert(section)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Create section error:', error);
        throw error;
      }
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
      try {
        const { data, error } = await supabase
          .from('check_template_items' as any)
          .insert(item)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Create item error:', error);
        throw error;
      }
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

// Update section
export const useUpdateCheckTemplateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CheckTemplateSectionInsert> }) => {
      const { data, error } = await supabase
        .from('check_template_sections' as any)
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
        title: "Section Updated",
        description: "Template section has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    },
  });
};

// Delete section
export const useDeleteCheckTemplateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('check_template_sections' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Section Deleted",
        description: "Template section has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    },
  });
};

// Update item
export const useUpdateCheckTemplateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CheckTemplateItemInsert> }) => {
      const { data, error } = await supabase
        .from('check_template_items' as any)
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
        title: "Item Updated",
        description: "Check item has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });
};

// Delete item
export const useDeleteCheckTemplateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('check_template_items' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-templates'] });
      toast({
        title: "Item Deleted",
        description: "Check item has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });
};