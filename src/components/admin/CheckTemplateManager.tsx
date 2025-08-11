import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useCheckTemplates, useDeleteCheckTemplate } from '@/hooks/queries/useCheckTemplates';
import { CreateCheckTemplateDialog } from './CreateCheckTemplateDialog';
import { EditCheckTemplateDialog } from './EditCheckTemplateDialog';
import { CheckTemplatePreview } from './CheckTemplatePreview';

export const CheckTemplateManager = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateType, setTemplateType] = useState<'home_check' | 'property_check'>('home_check');

  const { data: templates, isLoading } = useCheckTemplates();
  const deleteTemplateMutation = useDeleteCheckTemplate();

  const homeCheckTemplates = templates?.filter((t: any) => t.type === 'home_check') || [];
  const propertyCheckTemplates = templates?.filter((t: any) => t.type === 'property_check') || [];

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setSelectedTemplate(null);
    }
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleDelete = async (template: any) => {
    if (window.confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const handleCreate = (type: 'home_check' | 'property_check') => {
    setTemplateType(type);
    setCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Check Template Management</h1>
        </div>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const TemplateGrid = ({ templates, type }: { templates: any[], type: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="border-dashed border-2 flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-muted/50" 
            onClick={() => handleCreate(type as 'home_check' | 'property_check')}>
        <div className="text-center">
          <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Create New Template</p>
        </div>
      </Card>
      
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <Badge variant={template.is_active ? "default" : "secondary"}>
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground">{template.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="font-medium">{template.sections?.length || 0}</span> sections
              </div>
              <div className="text-sm">
                <span className="font-medium">
                  {template.sections?.reduce((total: number, section: any) => 
                    total + (section.items?.length || 0), 0) || 0}
                </span> check items
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(template)}
                disabled={deleteTemplateMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deleteTemplateMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Check Template Management</h1>
      </div>

      <Tabs defaultValue="home_check" className="space-y-6">
        <TabsList>
          <TabsTrigger value="home_check">Home Check Templates</TabsTrigger>
          <TabsTrigger value="property_check">Property Check Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="home_check" className="space-y-6">
          <TemplateGrid templates={homeCheckTemplates} type="home_check" />
        </TabsContent>

        <TabsContent value="property_check" className="space-y-6">
          <TemplateGrid templates={propertyCheckTemplates} type="property_check" />
        </TabsContent>
      </Tabs>

      <CreateCheckTemplateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        templateType={templateType}
      />

      {selectedTemplate && (
        <>
          <EditCheckTemplateDialog
            template={selectedTemplate}
            open={editDialogOpen}
            onOpenChange={handleEditDialogClose}
          />
          <CheckTemplatePreview
            template={selectedTemplate}
            open={previewDialogOpen}
            onOpenChange={setPreviewDialogOpen}
          />
        </>
      )}
    </div>
  );
};