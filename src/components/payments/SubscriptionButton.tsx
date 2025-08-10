import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSubscription, type CreateSubscriptionData } from "@/hooks/queries/usePayments";
import { RefreshCw, Calendar } from "lucide-react";
import { useState } from "react";

interface SubscriptionButtonProps {
  propertyId?: string;
  tenantId?: string;
  presetAmount?: number;
  presetType?: CreateSubscriptionData["plan_type"];
  presetDescription?: string;
  presetInterval?: "month" | "year";
}

export const SubscriptionButton = ({ 
  propertyId, 
  tenantId, 
  presetAmount, 
  presetType,
  presetDescription,
  presetInterval = "month"
}: SubscriptionButtonProps) => {
  const [amount, setAmount] = useState(presetAmount?.toString() || "");
  const [planType, setPlanType] = useState<CreateSubscriptionData["plan_type"]>(presetType || "rent");
  const [interval, setInterval] = useState<"month" | "year">(presetInterval);
  const [description, setDescription] = useState(presetDescription || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const createSubscription = useCreateSubscription();

  const handleCreateSubscription = () => {
    if (!amount || Number(amount) <= 0) {
      return;
    }

    const subscriptionData: CreateSubscriptionData = {
      amount: Number(amount),
      plan_type: planType,
      interval,
      description: description || undefined,
      property_id: propertyId,
      tenant_id: tenantId,
    };

    createSubscription.mutate(subscriptionData);
  };

  if (!isExpanded && presetAmount && presetType) {
    return (
      <Button 
        onClick={handleCreateSubscription}
        disabled={createSubscription.isPending}
        className="w-full"
        variant="outline"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        {createSubscription.isPending ? "Processing..." : `Subscribe $${presetAmount}/${interval}`}
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Create Subscription
        </CardTitle>
        <CardDescription>
          Set up recurring payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-type">Subscription Type</Label>
          <Select value={planType} onValueChange={(value) => setPlanType(value as CreateSubscriptionData["plan_type"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select subscription type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Monthly Rent</SelectItem>
              <SelectItem value="property_management">Property Management</SelectItem>
              <SelectItem value="house_watching">House Watching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Billing Interval</Label>
          <Select value={interval} onValueChange={(value) => setInterval(value as "month" | "year")}>
            <SelectTrigger>
              <SelectValue placeholder="Select billing interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter subscription description..."
            rows={2}
          />
        </div>

        <Button 
          onClick={handleCreateSubscription}
          disabled={createSubscription.isPending || !amount || Number(amount) <= 0}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {createSubscription.isPending ? "Processing..." : `Create Subscription`}
        </Button>

        {!presetAmount && !presetType && (
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(false)}
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};