import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Building2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useProperties } from "@/hooks/queries/useProperties";
import { useCreatePropertyServiceAssignment } from "@/hooks/queries/usePropertyServiceAssignments";
import { Service } from "@/hooks/queries/useServices";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AssignServiceDialogProps {
  services: Service[];
  trigger?: React.ReactNode;
}

export function AssignServiceDialog({ services, trigger }: AssignServiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [monthlyFee, setMonthlyFee] = useState<number>(0);
  const [rentPercentage, setRentPercentage] = useState<number>(0);
  const [billingStartDate, setBillingStartDate] = useState<Date>();

  const { data: properties, isLoading: propertiesLoading } = useProperties(1, 1000);
  const createAssignmentMutation = useCreatePropertyServiceAssignment();

  const selectedService = services.find(s => s.id === selectedServiceId);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setMonthlyFee(service.base_price);
      setRentPercentage(service.rent_percentage);
    }
  };

  const handleAssign = async () => {
    if (!selectedPropertyId || !selectedServiceId || !billingStartDate) {
      return;
    }

    await createAssignmentMutation.mutateAsync({
      property_id: selectedPropertyId,
      service_id: selectedServiceId,
      monthly_fee: monthlyFee,
      rent_percentage: rentPercentage,
      billing_start_date: format(billingStartDate, 'yyyy-MM-dd'),
      status: 'pending'
    });

    setIsOpen(false);
    // Reset form
    setSelectedPropertyId("");
    setSelectedServiceId("");
    setMonthlyFee(0);
    setRentPercentage(0);
    setBillingStartDate(undefined);
  };

  const handleSetupBilling = async () => {
    // This will integrate with Stripe checkout
    // For now, just update status to active
    console.log("Setting up billing for:", { selectedPropertyId, selectedServiceId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Building2 className="h-4 w-4 mr-2" />
            Assign to Property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Services to Property</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Selection */}
          <div className="space-y-2">
            <Label htmlFor="property">Select Property</Label>
            {propertiesLoading ? (
              <LoadingSpinner />
            ) : (
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Select Service Package</Label>
            <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service package" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.category.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Details */}
          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedService.name}</CardTitle>
                <CardDescription>{selectedService.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyFee">Monthly Fee ($)</Label>
                    <Input
                      id="monthlyFee"
                      type="number"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rentPercentage">Rent Percentage (%)</Label>
                    <Input
                      id="rentPercentage"
                      type="number"
                      value={rentPercentage}
                      onChange={(e) => setRentPercentage(Number(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Start Date */}
          <div className="space-y-2">
            <Label>Billing Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !billingStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {billingStartDate ? format(billingStartDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={billingStartDate}
                  onSelect={setBillingStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleAssign}
              disabled={!selectedPropertyId || !selectedServiceId || !billingStartDate || createAssignmentMutation.isPending}
              className="w-full"
            >
              {createAssignmentMutation.isPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Assign Service Package
                </>
              )}
            </Button>
            
            {selectedPropertyId && selectedServiceId && (
              <Button 
                variant="outline"
                onClick={handleSetupBilling}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Setup Stripe Billing
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}