import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Camera, MessageSquare } from 'lucide-react';
import { useCheckTemplate } from '@/hooks/queries/useCheckTemplates';

interface InteractiveCheckTemplatePreviewProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InteractiveCheckTemplatePreview = ({ 
  template, 
  open, 
  onOpenChange 
}: InteractiveCheckTemplatePreviewProps) => {
  const { data: fullTemplate, isLoading } = useCheckTemplate(template?.id);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, number>>({});

  if (!template) return null;

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const handleNotesChange = (itemId: string, value: string) => {
    setNotes(prev => ({ ...prev, [itemId]: value }));
  };

  const addPhoto = (itemId: string) => {
    setPhotos(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const totalItems = fullTemplate?.sections?.reduce((total: number, section: any) => 
    total + (section.items?.length || 0), 0) || 0;
  const completedItems = checkedItems.size;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Interactive Preview: {fullTemplate?.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Experience how house watchers interact with this template</p>
            </div>
            <Badge variant="outline" className="text-sm">
              Demo Mode
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Header */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Check Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedItems} of {totalItems} items completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-6">
          {fullTemplate?.sections?.map((section: any, sectionIndex: number) => (
            <Card key={section.id} className="border-l-4 border-l-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{sectionIndex + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{section.name}</CardTitle>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {section.items?.map((item: any) => {
                    const isChecked = checkedItems.has(item.id);
                    const itemNotes = notes[item.id] || '';
                    const photoCount = photos[item.id] || 0;
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={item.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={item.id} 
                              className={`text-sm cursor-pointer ${isChecked ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {item.item_text}
                            </label>
                            <div className="flex gap-2 mt-1">
                              {item.is_required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {isChecked && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Interactive elements */}
                        <div className="ml-6 space-y-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addPhoto(item.id)}
                              className="text-xs"
                            >
                              <Camera className="w-3 h-3 mr-1" />
                              Add Photo {photoCount > 0 && `(${photoCount})`}
                            </Button>
                            {photoCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Camera className="w-3 h-3" />
                                {photoCount} photo{photoCount !== 1 ? 's' : ''} attached
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Notes</span>
                            </div>
                            <Textarea
                              placeholder="Add notes about this check item..."
                              value={itemNotes}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              className="text-sm min-h-[60px]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!section.items || section.items.length === 0) && (
                    <div className="text-center p-6 text-muted-foreground">
                      <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No check items in this section</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(!fullTemplate?.sections || fullTemplate.sections.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <Circle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg mb-2">No sections configured</p>
                <p className="text-sm text-muted-foreground">This template needs sections and check items to be useful</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Footer */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              This preview shows how house watchers would interact with your template during actual checks
            </div>
            <Button onClick={() => onOpenChange(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};