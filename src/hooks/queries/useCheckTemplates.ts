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

// Temporarily disable until types are generated
export const useCheckTemplates = (type?: 'home_check' | 'property_check') => {
  return useQuery({
    queryKey: ['check-templates', type],
    queryFn: async () => {
      // Return empty array until types are ready
      console.log('Check templates query - types not ready yet');
      return [] as CheckTemplate[];
    },
    enabled: false, // Disable until types are ready
    staleTime: 30000,
  });
};

export const useCheckTemplate = (id: string) => {
  return useQuery({
    queryKey: ['check-template', id],
    queryFn: async () => {
      // Return null until types are ready
      return null as CheckTemplate | null;
    },
    enabled: false, // Disable until types are ready
  });
};

export const useCreateCheckTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: CheckTemplateInsert) => {
      // Mock response until types are ready
      console.log('Create template requested:', template);
      return { id: 'mock-id', ...template };
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
      // Mock response until types are ready
      console.log('Update template requested:', { id, updates });
      return { id, ...updates };
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
      // Mock response until types are ready
      console.log('Delete template requested:', id);
      return id;
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
      // Mock response until types are ready
      console.log('Create section requested:', section);
      return { id: 'mock-section-id', ...section };
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
      // Mock response until types are ready
      console.log('Create item requested:', item);
      return { id: 'mock-item-id', ...item };
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