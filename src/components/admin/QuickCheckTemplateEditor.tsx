import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical, X } from 'lucide-react';
import type { QuickCheckConfig, QuickCheckItem } from '@/hooks/queries/useCheckTemplates';

interface QuickCheckTemplateEditorProps {
  template: any;
  onUpdate: (config: QuickCheckConfig) => void;
}

export const QuickCheckTemplateEditor = ({ template, onUpdate }: QuickCheckTemplateEditorProps) => {
  const initialConfig: QuickCheckConfig = template.quick_check_config || {
    items: [],
    min_photos_required: 2,
  };

  const [config, setConfig] = useState<QuickCheckConfig>(initialConfig);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    question: '',
    options: ['Yes', 'No', 'N/A'],
    is_required: true,
  });

  const handleAddItem = () => {
    if (!newItem.question.trim()) return;
    if (config.items.length >= 10) {
      alert('Quick checks are limited to 10 items maximum');
      return;
    }

    const item: QuickCheckItem = {
      id: `item_${Date.now()}`,
      question: newItem.question,
      options: newItem.options.filter(o => o.trim()),
      is_required: newItem.is_required,
      sort_order: config.items.length,
    };

    const updatedConfig = {
      ...config,
      items: [...config.items, item],
    };
    
    setConfig(updatedConfig);
    onUpdate(updatedConfig);
    setNewItem({ question: '', options: ['Yes', 'No', 'N/A'], is_required: true });
  };

  const handleUpdateItem = (id: string, updates: Partial<QuickCheckItem>) => {
    const updatedConfig = {
      ...config,
      items: config.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    };
    
    setConfig(updatedConfig);
    onUpdate(updatedConfig);
    setEditingItemId(null);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const updatedConfig = {
      ...config,
      items: config.items.filter(item => item.id !== id),
    };
    
    setConfig(updatedConfig);
    onUpdate(updatedConfig);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const items = [...config.items];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    
    const updatedConfig = {
      ...config,
      items: items.map((item, index) => ({ ...item, sort_order: index })),
    };
    
    setConfig(updatedConfig);
    onUpdate(updatedConfig);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newItem.options];
    newOptions[index] = value;
    setNewItem({ ...newItem, options: newOptions });
  };

  const addOption = () => {
    if (newItem.options.length >= 5) {
      alert('Maximum 5 options allowed');
      return;
    }
    setNewItem({ ...newItem, options: [...newItem.options, ''] });
  };

  const removeOption = (index: number) => {
    if (newItem.options.length <= 2) {
      alert('Minimum 2 options required');
      return;
    }
    setNewItem({ ...newItem, options: newItem.options.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quick Check Configuration</h3>
          <p className="text-sm text-muted-foreground">Create 5-10 multiple choice questions</p>
        </div>
        <Badge variant={config.items.length >= 5 ? "default" : "secondary"}>
          {config.items.length}/10 items
        </Badge>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Minimum Photos Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              max="10"
              value={config.min_photos_required}
              onChange={(e) => {
                const updatedConfig = { ...config, min_photos_required: parseInt(e.target.value) || 0 };
                setConfig(updatedConfig);
                onUpdate(updatedConfig);
              }}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">photos required to complete check</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Add New Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={newItem.question}
              onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
              placeholder="e.g., Are all doors locked?"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>
            {newItem.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {newItem.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={newItem.is_required}
              onCheckedChange={(checked) => setNewItem({ ...newItem, is_required: checked })}
            />
            <Label>Required Question</Label>
          </div>

          <Button onClick={handleAddItem} disabled={!newItem.question.trim() || config.items.length >= 10}>
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="font-medium">Questions</h4>
        {config.items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No questions added yet. Add at least 5 questions to create a quick check.
            </CardContent>
          </Card>
        ) : (
          config.items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="cursor-grab active:cursor-grabbing pt-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.question}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.options.map((option, optIndex) => (
                            <Badge key={optIndex} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {item.is_required && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {config.items.length > 0 && config.items.length < 5 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Add at least {5 - config.items.length} more question{5 - config.items.length !== 1 ? 's' : ''} to meet the minimum requirement for quick checks.
          </p>
        </div>
      )}
    </div>
  );
};
