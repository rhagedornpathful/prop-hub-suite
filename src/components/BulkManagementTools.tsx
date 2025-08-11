import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Archive, ArchiveRestore, Check, ChevronDown, Download, Edit, FileText, 
  Mail, MessageSquare, MoreHorizontal, Phone, PlusCircle, Settings, 
  Trash2, Upload, Users, Zap, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyWithRelations } from '@/hooks/queries/useProperties';

interface BulkManagementToolsProps {
  properties: PropertyWithRelations[];
  selectedProperties: string[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

export const BulkManagementTools: React.FC<BulkManagementToolsProps> = ({
  properties,
  selectedProperties,
  onSelectionChange,
  onRefresh
}) => {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState<any>({});
  const { toast } = useToast();

  const bulkActions = [
    { id: 'update-status', label: 'Update Status', icon: Edit, needsDialog: true },
    { id: 'archive', label: 'Archive Properties', icon: Archive, needsDialog: false },
    { id: 'unarchive', label: 'Unarchive Properties', icon: ArchiveRestore, needsDialog: false },
    { id: 'assign-manager', label: 'Assign Manager', icon: Users, needsDialog: true },
    { id: 'update-rent', label: 'Update Rent', icon: Settings, needsDialog: true },
    { id: 'send-notifications', label: 'Send Notifications', icon: Mail, needsDialog: true },
    { id: 'export-data', label: 'Export Data', icon: Download, needsDialog: false },
    { id: 'delete', label: 'Delete Properties', icon: Trash2, needsDialog: true, destructive: true },
  ];

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(properties.map(p => p.id));
    }
  };

  const handleBulkAction = async (actionId: string) => {
    const action = bulkActions.find(a => a.id === actionId);
    if (!action || selectedProperties.length === 0) return;

    setBulkAction(actionId);
    
    if (action.needsDialog) {
      setShowBulkDialog(true);
      return;
    }

    await executeBulkAction(actionId);
  };

  const executeBulkAction = async (actionId: string, additionalData?: any) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const total = selectedProperties.length;
      let completed = 0;

      switch (actionId) {
        case 'archive':
          for (const propertyId of selectedProperties) {
            await supabase
              .from('properties')
              .update({ status: 'archived', updated_at: new Date().toISOString() })
              .eq('id', propertyId);
            completed++;
            setProgress((completed / total) * 100);
          }
          toast({
            title: "Properties Archived",
            description: `Successfully archived ${total} properties`,
          });
          break;

        case 'unarchive':
          for (const propertyId of selectedProperties) {
            await supabase
              .from('properties')
              .update({ status: 'active', updated_at: new Date().toISOString() })
              .eq('id', propertyId);
            completed++;
            setProgress((completed / total) * 100);
          }
          toast({
            title: "Properties Unarchived",
            description: `Successfully unarchived ${total} properties`,
          });
          break;

        case 'update-status':
          for (const propertyId of selectedProperties) {
            await supabase
              .from('properties')
              .update({ 
                status: additionalData.status, 
                updated_at: new Date().toISOString() 
              })
              .eq('id', propertyId);
            completed++;
            setProgress((completed / total) * 100);
          }
          toast({
            title: "Status Updated",
            description: `Updated status for ${total} properties`,
          });
          break;

        case 'update-rent':
          for (const propertyId of selectedProperties) {
            const updates: any = { updated_at: new Date().toISOString() };
            if (additionalData.rentAmount) {
              updates.monthly_rent = additionalData.rentAmount;
            }
            if (additionalData.rentIncrease) {
              const property = properties.find(p => p.id === propertyId);
              if (property?.monthly_rent) {
                updates.monthly_rent = property.monthly_rent * (1 + additionalData.rentIncrease / 100);
              }
            }
            
            await supabase
              .from('properties')
              .update(updates)
              .eq('id', propertyId);
            completed++;
            setProgress((completed / total) * 100);
          }
          toast({
            title: "Rent Updated",
            description: `Updated rent for ${total} properties`,
          });
          break;

        case 'export-data':
          const selectedProps = properties.filter(p => selectedProperties.includes(p.id));
          const csvData = generateCSV(selectedProps);
          downloadCSV(csvData, 'properties-export.csv');
          toast({
            title: "Data Exported",
            description: `Exported ${total} properties to CSV`,
          });
          break;

        case 'delete':
          for (const propertyId of selectedProperties) {
            await supabase
              .from('properties')
              .delete()
              .eq('id', propertyId);
            completed++;
            setProgress((completed / total) * 100);
          }
          toast({
            title: "Properties Deleted",
            description: `Successfully deleted ${total} properties`,
            variant: "destructive",
          });
          break;

        default:
          toast({
            title: "Action Not Implemented",
            description: `${actionId} will be available soon`,
          });
      }

      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({
        title: "Error",
        description: "Failed to execute bulk action",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setShowBulkDialog(false);
      setBulkAction('');
      setBulkUpdateData({});
    }
  };

  const generateCSV = (data: PropertyWithRelations[]) => {
    const headers = [
      'Address', 'City', 'State', 'ZIP', 'Type', 'Status', 'Bedrooms', 'Bathrooms',
      'Square Feet', 'Monthly Rent', 'Estimated Value', 'Year Built', 'Owner', 'Created'
    ];
    
    const rows = data.map(property => [
      property.address || '',
      property.city || '',
      property.state || '',
      property.zip_code || '',
      property.property_type || '',
      property.status || '',
      property.bedrooms || '',
      property.bathrooms || '',
      property.square_feet || '',
      property.monthly_rent || '',
      property.estimated_value || '',
      property.year_built || '',
      property.property_owner ? 
        `${property.property_owner.first_name} ${property.property_owner.last_name}` : '',
      new Date(property.created_at).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderBulkDialog = () => {
    const action = bulkActions.find(a => a.id === bulkAction);
    if (!action) return null;

    return (
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <action.icon className="h-5 w-5" />
              {action.label}
            </DialogTitle>
            <DialogDescription>
              Configure settings for {selectedProperties.length} selected properties
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {bulkAction === 'update-status' && (
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select onValueChange={(value) => setBulkUpdateData({ status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'update-rent' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Update Method</Label>
                  <Select onValueChange={(value) => setBulkUpdateData({ method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Set Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage Increase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {bulkUpdateData.method === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Monthly Rent ($)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      onChange={(e) => setBulkUpdateData({ 
                        ...bulkUpdateData, 
                        rentAmount: parseFloat(e.target.value) 
                      })}
                    />
                  </div>
                )}

                {bulkUpdateData.method === 'percentage' && (
                  <div className="space-y-2">
                    <Label>Increase Percentage (%)</Label>
                    <Input
                      type="number"
                      placeholder="Enter percentage"
                      onChange={(e) => setBulkUpdateData({ 
                        ...bulkUpdateData, 
                        rentIncrease: parseFloat(e.target.value) 
                      })}
                    />
                  </div>
                )}
              </div>
            )}

            {bulkAction === 'delete' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. All selected properties and their associated data will be permanently deleted.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => executeBulkAction(bulkAction, bulkUpdateData)}
              variant={action.destructive ? "destructive" : "default"}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Apply to ${selectedProperties.length} Properties`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (selectedProperties.length === 0) return null;

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedProperties.length === properties.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">
                  {selectedProperties.length} of {properties.length} selected
                </span>
              </div>
              
              {selectedProperties.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Bulk Actions Available
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isProcessing}>
                    <Zap className="h-4 w-4 mr-2" />
                    Bulk Actions
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {bulkActions.map((action) => (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => handleBulkAction(action.id)}
                      className={action.destructive ? "text-destructive" : ""}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectionChange([])}
                disabled={isProcessing}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing {bulkAction}...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {renderBulkDialog()}
    </>
  );
};