import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { compressImage } from '@/lib/performance/imageOptimization';

interface BulkPropertyImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export function BulkPropertyImport({ open, onOpenChange, onSuccess }: BulkPropertyImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const downloadTemplate = () => {
    const csvContent = `address,city,state,zip_code,bedrooms,bathrooms,square_footage,monthly_rent,purchase_price,status,property_type,description
123 Main St,Boston,MA,02101,3,2,1500,2500,450000,active,residential,Beautiful family home
456 Oak Ave,Cambridge,MA,02138,2,1,1000,2000,350000,active,residential,Modern apartment`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'Fill out the CSV template and upload it to import properties.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileType === 'csv' || fileType === 'xlsx' || fileType === 'xls') {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a CSV or Excel file.',
          variant: 'destructive',
        });
      }
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      
      data.push(row);
    }

    return data;
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        throw new Error('No valid data found in file');
      }

      const results: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setProgress(((i + 1) / rows.length) * 100);

        try {
          // Validate required fields
          if (!row.address || !row.city || !row.state) {
            throw new Error('Missing required fields: address, city, or state');
          }

          // Prepare property data
          const propertyData = {
            user_id: user.id,
            address: row.address,
            city: row.city,
            state: row.state,
            zip_code: row.zip_code,
            bedrooms: row.bedrooms ? parseInt(row.bedrooms) : null,
            bathrooms: row.bathrooms ? parseFloat(row.bathrooms) : null,
            square_footage: row.square_footage ? parseInt(row.square_footage) : null,
            monthly_rent: row.monthly_rent ? parseFloat(row.monthly_rent) : null,
            purchase_price: row.purchase_price ? parseFloat(row.purchase_price) : null,
            status: row.status || 'active',
            property_type: row.property_type || 'residential',
            description: row.description || null,
          };

          const { error } = await supabase
            .from('properties')
            .insert(propertyData);

          if (error) throw error;
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 because row 1 is header, array is 0-indexed
            error: error.message,
          });
        }
      }

      setResult(results);
      
      if (results.success > 0) {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${results.success} properties. ${results.failed} failed.`,
        });
        onSuccess();
      } else {
        toast({
          title: 'Import Failed',
          description: 'No properties were imported. Check the errors below.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Import Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Bulk Property Import
          </DialogTitle>
          <DialogDescription>
            Import multiple properties from CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Step 1: Download Template</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download our CSV template with all required and optional fields
            </p>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload File */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Step 2: Upload File</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Upload your completed CSV or Excel file
            </p>
            
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="bulk-import-file"
                disabled={importing}
              />
              <label htmlFor="bulk-import-file">
                <Button variant="outline" asChild disabled={importing}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
              
              {file && (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={importing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing properties...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {result.success} Imported
                </Badge>
                {result.failed > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {result.failed} Failed
                  </Badge>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-medium mb-2">Import Errors:</h4>
                  <div className="space-y-2">
                    {result.errors.map((error, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">Row {error.row}:</span>{' '}
                        <span className="text-destructive">{error.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? 'Importing...' : 'Import Properties'}
            </Button>
          </div>

          {/* Field Reference */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 text-sm">Required Fields:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• <span className="font-medium">address</span> - Street address</p>
              <p>• <span className="font-medium">city</span> - City name</p>
              <p>• <span className="font-medium">state</span> - State abbreviation (e.g., MA, CA)</p>
            </div>
            <h4 className="font-medium mb-2 text-sm mt-3">Optional Fields:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• zip_code, bedrooms, bathrooms, square_footage</p>
              <p>• monthly_rent, purchase_price, status, property_type, description</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
