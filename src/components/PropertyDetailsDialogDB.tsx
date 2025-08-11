import { EnterprisePropertyDetails } from "@/components/EnterprisePropertyDetails";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<'properties'>;

interface PropertyDetailsDialogDBProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyDetailsDialogDB({ property, open, onOpenChange, onEdit, onDelete }: PropertyDetailsDialogDBProps) {
  return (
    <EnterprisePropertyDetails 
      property={property}
      open={open}
      onOpenChange={onOpenChange}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}