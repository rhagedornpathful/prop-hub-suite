import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PropertyWithRelations } from '@/hooks/queries/useProperties';

interface PropertyComparisonProps {
  properties: PropertyWithRelations[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: string) => void;
}

export function PropertyComparison({
  properties,
  open,
  onOpenChange,
  onRemove,
}: PropertyComparisonProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value: number | null) => {
    if (!value) return 'N/A';
    return value.toLocaleString();
  };

  const getComparisonIndicator = (values: (number | null)[], index: number) => {
    const currentValue = values[index];
    if (!currentValue) return null;

    const otherValues = values.filter((v, i) => i !== index && v !== null) as number[];
    if (otherValues.length === 0) return null;

    const avgOthers = otherValues.reduce((sum, v) => sum + v, 0) / otherValues.length;
    const diff = ((currentValue - avgOthers) / avgOthers) * 100;

    if (Math.abs(diff) < 5) {
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    }

    return diff > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  if (properties.length === 0) return null;

  const monthlyRents = properties.map(p => p.monthly_rent);
  const purchasePrices = properties.map(p => p.purchase_price);
  const squareFootages = properties.map(p => (p as any).square_footage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Property Comparison</DialogTitle>
          <DialogDescription>
            Compare {properties.length} properties side-by-side
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium sticky left-0 bg-background z-10">
                  <div className="w-32">Field</div>
                </th>
                {properties.map((property) => (
                  <th key={property.id} className="p-3 min-w-[200px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm line-clamp-2">
                          {property.address}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {property.city}, {property.state}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(property.id)}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Status */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Status
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status || 'active'}
                    </Badge>
                  </td>
                ))}
              </tr>

              {/* Property Type */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Type
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.property_type || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Bedrooms
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.bedrooms || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Bathrooms
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    {property.bathrooms || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Square Footage */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Square Footage
                </td>
                {properties.map((property, idx) => (
                  <td key={property.id} className="p-3">
                    <div className="flex items-center gap-2">
                      {getComparisonIndicator(squareFootages, idx)}
                      <span>{formatNumber((property as any).square_footage)}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Monthly Rent */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Monthly Rent
                </td>
                {properties.map((property, idx) => (
                  <td key={property.id} className="p-3">
                    <div className="flex items-center gap-2">
                      {getComparisonIndicator(monthlyRents, idx)}
                      <span className="font-medium">
                        {formatCurrency(property.monthly_rent)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Purchase Price */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Purchase Price
                </td>
                {properties.map((property, idx) => (
                  <td key={property.id} className="p-3">
                    <div className="flex items-center gap-2">
                      {getComparisonIndicator(purchasePrices, idx)}
                      <span className="font-medium">
                        {formatCurrency(property.purchase_price)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price per Sq Ft */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Price per Sq Ft
                </td>
                {properties.map((property) => {
                  const pricePerSqFt =
                    property.purchase_price && (property as any).square_footage
                      ? property.purchase_price / (property as any).square_footage
                      : null;
                  return (
                    <td key={property.id} className="p-3">
                      {pricePerSqFt ? `$${pricePerSqFt.toFixed(2)}` : 'N/A'}
                    </td>
                  );
                })}
              </tr>

              {/* Maintenance Count */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Maintenance
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3">
                    <div className="space-y-1">
                      <div className="text-sm">
                        Total: {property.maintenance_count || 0}
                      </div>
                      {property.pending_maintenance ? (
                        <Badge variant="secondary" className="text-xs">
                          {property.pending_maintenance} pending
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Last Check */}
              <tr className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium sticky left-0 bg-background">
                  Last Check
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="p-3 text-sm">
                    {property.last_check_date
                      ? new Date(property.last_check_date).toLocaleDateString()
                      : 'Never'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
