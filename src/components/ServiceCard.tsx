import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2 } from "lucide-react";
import { Service } from "@/hooks/queries/useServices";

interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  showActions?: boolean;
}

export function ServiceCard({ service, onSelect, isSelected, showSelectButton = true, onEdit, onDelete, showActions = false }: ServiceCardProps) {
  const formatPrice = (service: Service) => {
    if (service.billing_type === 'quote_based') {
      return 'Quote-based';
    }
    
    if (service.category === 'property_management') {
      return `$${service.base_price}/month + ${service.rent_percentage}% of rent`;
    }
    
    if (service.billing_type === 'monthly') {
      return `$${service.base_price}/month`;
    }
    
    return `$${service.base_price}`;
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'house_watching':
        return 'default';
      case 'property_management':
        return 'secondary';
      case 'add_on':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'house_watching':
        return 'House Watching';
      case 'property_management':
        return 'Property Management';
      case 'add_on':
        return 'Add-On Service';
      default:
        return category;
    }
  };

  const getTierBadgeVariant = (tier: string | null) => {
    switch (tier) {
      case 'essential':
      case 'standard':
        return 'default';
      case 'premier':
      case 'premium':
        return 'secondary';
      case 'platinum':
      case 'executive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={`relative transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant={getCategoryBadgeVariant(service.category)}>
                {getCategoryLabel(service.category)}
              </Badge>
              {service.package_tier && (
                <Badge variant={getTierBadgeVariant(service.package_tier)} className="capitalize">
                  {service.package_tier}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{service.name}</CardTitle>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(service)}
            </div>
          </div>
        </div>
        {service.description && (
          <CardDescription className="text-base">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Features Included
          </h4>
          <ul className="space-y-2">
            {service.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-2">
          {showSelectButton && onSelect && (
            <Button
              onClick={() => onSelect(service)}
              variant={isSelected ? "default" : "outline"}
              className="flex-1"
            >
              {isSelected ? "Selected" : "Select Service"}
            </Button>
          )}
          
          {showActions && (
            <>
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(service)}
                  className="px-3"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(service)}
                  className="px-3 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}