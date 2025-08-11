import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpdateCheckTemplate, useCheckTemplate } from '@/hooks/queries/useCheckTemplates';
import { TemplateSectionEditor } from './TemplateSectionEditor';

interface EditCheckTemplateDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditCheckTemplateDialog = ({ 
  template, 
  open, 
  onOpenChange 
}: EditCheckTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const updateTemplateMutation = useUpdateCheckTemplate();
  const { data: fullTemplate, isLoading } = useCheckTemplate(template?.id || '');

  useEffect(() => {
    if (fullTemplate) {
      setFormData({
        name: fullTemplate.name || '',
        description: fullTemplate.description || '',
        is_active: fullTemplate.is_active ?? true,
      });
    }
  }, [fullTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }
    
    updateTemplateMutation.mutate({
      id: fullTemplate?.id || template.id,
      updates: formData,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Template...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template: {fullTemplate?.name || template?.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Template Details</TabsTrigger>
            <TabsTrigger value="sections">Sections & Items</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter template name"
                  required
                  className={!formData.name.trim() && formData.name.length > 0 ? 'border-destructive' : ''}
                />
                {!formData.name.trim() && formData.name.length > 0 && (
                  <p className="text-sm text-destructive">Template name is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTemplateMutation.isPending || !formData.name.trim()}
                >
                  {updateTemplateMutation.isPending ? 'Updating...' : 'Update Template'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">Loading sections...</div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Changes to sections and items are saved individually when you click the "Save" button next to each item you edit.
                  </p>
                </div>
                <TemplateSectionEditor template={fullTemplate} />
                <div className="flex justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};