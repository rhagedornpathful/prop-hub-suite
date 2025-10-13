import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Filter, Plus, Trash2 } from 'lucide-react';

interface MessageRule {
  id: string;
  condition: 'contains' | 'from' | 'subject';
  value: string;
  action: 'label' | 'archive' | 'star';
  actionValue: string;
}

export const MessageRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<MessageRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<MessageRule>>({
    condition: 'contains',
    action: 'label',
  });

  const handleAddRule = () => {
    if (!newRule.value || !newRule.actionValue) {
      toast({
        title: "Invalid Rule",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const rule: MessageRule = {
      id: Date.now().toString(),
      condition: newRule.condition!,
      value: newRule.value!,
      action: newRule.action!,
      actionValue: newRule.actionValue!,
    };

    setRules([...rules, rule]);
    setNewRule({ condition: 'contains', action: 'label', value: '', actionValue: '' });

    toast({
      title: "Rule Added",
      description: "Message rule has been created",
    });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    toast({
      title: "Rule Deleted",
      description: "Message rule has been removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <CardTitle>Message Rules</CardTitle>
        </div>
        <CardDescription>
          Automatically categorize and label incoming messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Create New Rule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Condition</Label>
              <Select 
                value={newRule.condition} 
                onValueChange={(v: any) => setNewRule({ ...newRule, condition: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Message contains</SelectItem>
                  <SelectItem value="from">From sender</SelectItem>
                  <SelectItem value="subject">Subject contains</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                placeholder="Enter text..."
                value={newRule.value || ''}
                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
              />
            </div>
            <div>
              <Label>Action</Label>
              <Select 
                value={newRule.action} 
                onValueChange={(v: any) => setNewRule({ ...newRule, action: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="label">Add label</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{newRule.action === 'label' ? 'Label Name' : 'Action'}</Label>
              <Input
                placeholder={newRule.action === 'label' ? 'Label name...' : 'Confirm action'}
                value={newRule.actionValue || ''}
                onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                disabled={newRule.action !== 'label'}
              />
            </div>
          </div>
          <Button onClick={handleAddRule} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        {rules.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Active Rules</h3>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="text-sm">
                    <span className="font-medium">If {rule.condition}</span> "{rule.value}"
                    <span className="font-medium"> then {rule.action}</span>
                    {rule.action === 'label' && ` "${rule.actionValue}"`}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
