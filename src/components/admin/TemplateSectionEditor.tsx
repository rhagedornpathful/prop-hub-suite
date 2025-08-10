import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useCreateCheckTemplateSection, useCreateCheckTemplateItem } from '@/hooks/queries/useCheckTemplates';

interface TemplateSectionEditorProps {
  template: any;
}

export const TemplateSectionEditor = ({ template }: TemplateSectionEditorProps) => {
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [newItems, setNewItems] = useState<{ [sectionId: string]: { text: string, required: boolean } }>({});
  const [showAddSection, setShowAddSection] = useState(false);

  const createSectionMutation = useCreateCheckTemplateSection();
  const createItemMutation = useCreateCheckTemplateItem();

  const handleAddSection = () => {
    if (!newSection.name.trim()) return;

    const nextSortOrder = Math.max(...(template.sections?.map((s: any) => s.sort_order) || [0])) + 1;

    createSectionMutation.mutate({
      template_id: template.id,
      name: newSection.name,
      description: newSection.description,
      sort_order: nextSortOrder,
    }, {
      onSuccess: () => {
        setNewSection({ name: '', description: '' });
        setShowAddSection(false);
      },
    });
  };

  const handleAddItem = (sectionId: string) => {
    const itemData = newItems[sectionId];
    if (!itemData?.text.trim()) return;

    const section = template.sections?.find((s: any) => s.id === sectionId);
    const nextSortOrder = Math.max(...(section?.items?.map((i: any) => i.sort_order) || [0])) + 1;

    createItemMutation.mutate({
      section_id: sectionId,
      item_text: itemData.text,
      is_required: itemData.required,
      sort_order: nextSortOrder,
    }, {
      onSuccess: () => {
        setNewItems(prev => ({ ...prev, [sectionId]: { text: '', required: false } }));
      },
    });
  };

  const updateNewItem = (sectionId: string, field: string, value: any) => {
    setNewItems(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sections & Check Items</h3>
        <Button onClick={() => setShowAddSection(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Section
        </Button>
      </div>

      {showAddSection && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Add New Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                value={newSection.name}
                onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter section name"
              />
            </div>
            <div>
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                value={newSection.description}
                onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter section description"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSection} size="sm">Add Section</Button>
              <Button onClick={() => setShowAddSection(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {template.sections?.map((section: any) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{section.name}</CardTitle>
                <Badge variant="outline">{section.items?.length || 0} items</Badge>
              </div>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{item.item_text}</span>
                  {item.is_required && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new check item..."
                    value={newItems[section.id]?.text || ''}
                    onChange={(e) => updateNewItem(section.id, 'text', e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newItems[section.id]?.required || false}
                      onCheckedChange={(checked) => updateNewItem(section.id, 'required', checked)}
                    />
                    <Label className="text-xs">Required</Label>
                  </div>
                  <Button 
                    onClick={() => handleAddItem(section.id)}
                    size="sm"
                    disabled={!newItems[section.id]?.text?.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};