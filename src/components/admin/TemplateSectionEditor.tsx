import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useCreateCheckTemplateSection, useCreateCheckTemplateItem, useUpdateCheckTemplateSection, useDeleteCheckTemplateSection, useUpdateCheckTemplateItem, useDeleteCheckTemplateItem } from '@/hooks/queries/useCheckTemplates';

interface TemplateSectionEditorProps {
  template: any;
}

export const TemplateSectionEditor = ({ template }: TemplateSectionEditorProps) => {
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [newItems, setNewItems] = useState<{ [sectionId: string]: { text: string, required: boolean } }>({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editSectionData, setEditSectionData] = useState({ name: '', description: '' });
  const [editItemData, setEditItemData] = useState({ text: '', required: false });

  const createSectionMutation = useCreateCheckTemplateSection();
  const createItemMutation = useCreateCheckTemplateItem();
  const updateSectionMutation = useUpdateCheckTemplateSection();
  const deleteSectionMutation = useDeleteCheckTemplateSection();
  const updateItemMutation = useUpdateCheckTemplateItem();
  const deleteItemMutation = useDeleteCheckTemplateItem();

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

  const handleEditSection = (section: any) => {
    setEditingSection(section.id);
    setEditSectionData({ name: section.name, description: section.description || '' });
  };

  const handleUpdateSection = () => {
    if (!editSectionData.name.trim() || !editingSection) return;

    updateSectionMutation.mutate({
      id: editingSection,
      updates: editSectionData,
    }, {
      onSuccess: () => {
        setEditingSection(null);
        setEditSectionData({ name: '', description: '' });
      },
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section and all its items?')) {
      deleteSectionMutation.mutate(sectionId);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item.id);
    setEditItemData({ text: item.item_text, required: item.is_required });
  };

  const handleUpdateItem = () => {
    if (!editItemData.text.trim() || !editingItem) return;

    updateItemMutation.mutate({
      id: editingItem,
      updates: { item_text: editItemData.text, is_required: editItemData.required },
    }, {
      onSuccess: () => {
        setEditingItem(null);
        setEditItemData({ text: '', required: false });
      },
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(itemId);
    }
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
              {editingSection === section.id ? (
                <div className="space-y-2">
                  <Input
                    value={editSectionData.name}
                    onChange={(e) => setEditSectionData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Section name"
                  />
                  <Textarea
                    value={editSectionData.description}
                    onChange={(e) => setEditSectionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Section description"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateSection} size="sm">Save</Button>
                    <Button onClick={() => setEditingSection(null)} variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">{section.items?.length || 0} items</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(section.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items?.map((item: any) => (
                <div key={item.id} className="border rounded p-2">
                  {editingItem === item.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editItemData.text}
                        onChange={(e) => setEditItemData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Item text"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editItemData.required}
                          onCheckedChange={(checked) => setEditItemData(prev => ({ ...prev, required: checked }))}
                        />
                        <Label className="text-xs">Required</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateItem} size="sm">Save</Button>
                        <Button onClick={() => setEditingItem(null)} variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{item.item_text}</span>
                      {item.is_required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
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