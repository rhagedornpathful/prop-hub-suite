import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateCheckTemplate } from '@/hooks/queries/useCheckTemplates';

interface CreateCheckTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: 'home_check' | 'property_check';
}

export const CreateCheckTemplateDialog = ({ 
  open, 
  onOpenChange, 
  templateType 
}: CreateCheckTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const createTemplateMutation = useCreateCheckTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }
    
    createTemplateMutation.mutate({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: templateType,
    }, {
      onSuccess: () => {
        setFormData({ name: '', description: '', is_active: true });
        onOpenChange(false);
      },
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create {templateType === 'home_check' ? 'Home Check' : 'Property Check'} Template
          </DialogTitle>
        </DialogHeader>

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
               disabled={createTemplateMutation.isPending || !formData.name.trim()}
             >
               {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};