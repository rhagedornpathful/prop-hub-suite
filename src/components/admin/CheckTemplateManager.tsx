import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { useCheckTemplates, useDeleteCheckTemplate } from '@/hooks/queries/useCheckTemplates';
import { CreateCheckTemplateDialog } from './CreateCheckTemplateDialog';
import { EditCheckTemplateDialog } from './EditCheckTemplateDialog';
import { CheckTemplatePreview } from './CheckTemplatePreview';
import { InteractiveCheckTemplatePreview } from './InteractiveCheckTemplatePreview';

export const CheckTemplateManager = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [interactivePreviewOpen, setInteractivePreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateType, setTemplateType] = useState<'home_check' | 'property_check'>('home_check');

  const { data: templates, isLoading } = useCheckTemplates();
  
  console.log('Templates data:', templates);
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

  const handleInteractivePreview = (template: any) => {
    setSelectedTemplate(template);
    setInteractivePreviewOpen(true);
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
      <Card className="border-dashed border-2 flex items-center justify-center min-h-[240px] cursor-pointer hover:bg-muted/50 transition-colors" 
            onClick={() => handleCreate(type as 'home_check' | 'property_check')}>
        <div className="text-center p-6">
          <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-2">Create New Template</h3>
          <p className="text-sm text-muted-foreground">
            Add a new {type === 'home_check' ? 'home check' : 'property check'} template
          </p>
        </div>
      </Card>
      
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-all duration-200 min-h-[240px] flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-xl font-semibold leading-tight">{template.name}</CardTitle>
              <Badge variant={template.is_active ? "default" : "secondary"} className="ml-2 shrink-0">
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded-lg">
                <span className="text-muted-foreground">Sections:</span>
                <span className="font-semibold text-lg">{template.sections?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded-lg">
                <span className="text-muted-foreground">Check Items:</span>
                <span className="font-semibold text-lg">
                  {template.sections?.reduce((total: number, section: any) => 
                    total + (section.items?.length || 0), 0) || 0}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePreview(template)} className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEdit(template)} className="flex-1">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleInteractivePreview(template)}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Test
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(template)}
                disabled={deleteTemplateMutation.isPending}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check Template Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage templates for home and property inspections</p>
        </div>
      </div>

      <Tabs defaultValue="home_check" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="home_check" className="text-sm font-medium">
            Home Check Templates
          </TabsTrigger>
          <TabsTrigger value="property_check" className="text-sm font-medium">
            Property Check Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home_check" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Home Check Templates</h2>
            <Badge variant="outline">{homeCheckTemplates.length} templates</Badge>
          </div>
          <TemplateGrid templates={homeCheckTemplates} type="home_check" />
        </TabsContent>

        <TabsContent value="property_check" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Property Check Templates</h2>
            <Badge variant="outline">{propertyCheckTemplates.length} templates</Badge>
          </div>
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
          <InteractiveCheckTemplatePreview
            template={selectedTemplate}
            open={interactivePreviewOpen}
            onOpenChange={setInteractivePreviewOpen}
          />
        </>
      )}
    </div>
  );
};