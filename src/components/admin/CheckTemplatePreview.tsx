import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface CheckTemplatePreviewProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckTemplatePreview = ({ 
  template, 
  open, 
  onOpenChange 
}: CheckTemplatePreviewProps) => {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Preview: {template.name}</DialogTitle>
            <Badge variant={template.is_active ? "default" : "secondary"}>
              {template.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {template.description && (
            <p className="text-sm text-muted-foreground">{template.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {template.sections?.map((section: any) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="text-lg">{section.name}</CardTitle>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items?.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm">{item.item_text}</span>
                        {item.is_required && (
                          <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!section.items || section.items.length === 0) && (
                    <p className="text-sm text-muted-foreground">No check items in this section</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(!template.sections || template.sections.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No sections configured for this template</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};