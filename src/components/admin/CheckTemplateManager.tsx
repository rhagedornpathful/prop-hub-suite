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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Create New Template Card */}
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group" 
            onClick={() => handleCreate(type as 'home_check' | 'property_check')}>
        <CardContent className="flex flex-col items-center justify-center h-[320px] text-center p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Create New Template</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Add a new {type === 'home_check' ? 'home check' : 'property check'} template
          </p>
        </CardContent>
      </Card>
      
      {/* Template Cards */}
      {templates.map((template) => (
        <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 border bg-card">
          <CardHeader className="pb-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
                  {template.name}
                </CardTitle>
              </div>
              <Badge variant={template.is_active ? "default" : "secondary"} className="shrink-0">
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {template.description}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {template.sections?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Sections
                </div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {template.sections?.reduce((total: number, section: any) => 
                    total + (section.items?.length || 0), 0) || 0}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Check Items
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePreview(template)}
                  className="h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(template)}
                  className="h-8 text-xs"
                >
                  <Edit className="h-3 w-3 mr-1.5" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleInteractivePreview(template)}
                  className="h-8 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1.5" />
                  Test Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(template)}
                  disabled={deleteTemplateMutation.isPending}
                  className="h-8 text-xs hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  {deleteTemplateMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Check Template Management</h1>
        <p className="text-muted-foreground">Create and manage templates for home and property inspections</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="home_check" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
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
            <Badge variant="outline" className="text-sm">
              {homeCheckTemplates.length} template{homeCheckTemplates.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <TemplateGrid templates={homeCheckTemplates} type="home_check" />
        </TabsContent>

        <TabsContent value="property_check" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Property Check Templates</h2>
            <Badge variant="outline" className="text-sm">
              {propertyCheckTemplates.length} template{propertyCheckTemplates.length !== 1 ? 's' : ''}
            </Badge>
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