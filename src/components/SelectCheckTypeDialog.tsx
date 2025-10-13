import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Zap, ClipboardList } from 'lucide-react';

interface SelectCheckTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (checkType: 'quick' | 'full') => void;
  propertyAddress?: string;
}

export const SelectCheckTypeDialog = ({ 
  open, 
  onOpenChange, 
  onSelectType,
  propertyAddress 
}: SelectCheckTypeDialogProps) => {
  const [selectedType, setSelectedType] = useState<'quick' | 'full'>('quick');

  const handleContinue = () => {
    onSelectType(selectedType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Check Type</DialogTitle>
          <DialogDescription>
            {propertyAddress && `For: ${propertyAddress}`}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as 'quick' | 'full')}>
          <div className="space-y-3">
            <Card className={`cursor-pointer transition-all ${selectedType === 'quick' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="quick" id="quick" className="mt-1" />
                  <Label htmlFor="quick" className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">Quick Check</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• 5-10 multiple choice questions</p>
                          <p>• Minimum 2 photos required</p>
                          <p>• Faster completion (~5 minutes)</p>
                          <p>• Ideal for routine checks</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all ${selectedType === 'full' ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <ClipboardList className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">Full Check</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• Detailed sectioned checklist</p>
                          <p>• Comprehensive inspection</p>
                          <p>• Photos and notes per item</p>
                          <p>• Best for thorough inspections</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Continue with {selectedType === 'quick' ? 'Quick' : 'Full'} Check
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
