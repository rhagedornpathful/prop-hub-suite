import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Archive,
  ArchiveRestore
} from "lucide-react";
import type { PropertyOwner } from "@/utils/propertyOwnerHelpers";
import { getOwnerInitials, formatPaymentMethod } from "@/utils/propertyOwnerHelpers";

interface OwnerCardProps {
  owner: PropertyOwner;
  onView: (owner: PropertyOwner) => void;
  onEdit: (owner: PropertyOwner) => void;
  onDelete: (owner: PropertyOwner) => void;
  onArchive: (owner: PropertyOwner) => void;
  onUnarchive: (owner: PropertyOwner) => void;
}

export const OwnerCard = ({
  owner,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive
}: OwnerCardProps) => {
  return (
    <Card 
      className="shadow-md border-0 hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden"
      onClick={() => onView(owner)}
    >
      <CardHeader className="pb-4 relative">
        {owner.is_self && (
          <Badge variant="secondary" className="absolute top-4 right-4 text-xs z-10">
            Me
          </Badge>
        )}
        
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
              {owner.company_name ? (
                <Building2 className="h-8 w-8" />
              ) : (
                <span>{getOwnerInitials(owner)}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted border-2 border-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <h3 className="font-bold text-lg text-foreground leading-tight">
                  {owner.first_name} {owner.last_name}
                </h3>
                {owner.company_name && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {owner.company_name}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onView(owner);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(owner);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Owner
                  </DropdownMenuItem>
                  {owner.status === 'archived' ? (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onUnarchive(owner);
                    }}>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive Owner
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onArchive(owner);
                    }}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Owner
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(owner);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Owner
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{owner.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{owner.phone}</span>
          </div>
          {owner.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {owner.city}, {owner.state}
              </span>
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">
                {owner.property_count || 0} {(owner.property_count || 0) === 1 ? 'Property' : 'Properties'}
              </span>
            </div>
            {(owner.property_count || 0) > 0 && (
              <Badge variant="outline" className="bg-background">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-medium text-foreground">
              {formatPaymentMethod(owner.preferred_payment_method)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onView(owner);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(owner);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
