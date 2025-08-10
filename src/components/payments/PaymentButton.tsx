import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePayment, type CreatePaymentData } from "@/hooks/queries/usePayments";
import { CreditCard, DollarSign } from "lucide-react";
import { useState } from "react";

interface PaymentButtonProps {
  propertyId?: string;
  tenantId?: string;
  presetAmount?: number;
  presetType?: CreatePaymentData["payment_type"];
  presetDescription?: string;
}

export const PaymentButton = ({ 
  propertyId, 
  tenantId, 
  presetAmount, 
  presetType,
  presetDescription 
}: PaymentButtonProps) => {
  const [amount, setAmount] = useState(presetAmount?.toString() || "");
  const [paymentType, setPaymentType] = useState<CreatePaymentData["payment_type"]>(presetType || "rent");
  const [description, setDescription] = useState(presetDescription || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const createPayment = useCreatePayment();

  const handleCreatePayment = () => {
    if (!amount || Number(amount) <= 0) {
      return;
    }

    const paymentData: CreatePaymentData = {
      amount: Number(amount),
      payment_type: paymentType,
      description: description || undefined,
      property_id: propertyId,
      tenant_id: tenantId,
    };

    createPayment.mutate(paymentData);
  };

  if (!isExpanded && presetAmount && presetType) {
    return (
      <Button 
        onClick={handleCreatePayment}
        disabled={createPayment.isPending}
        className="w-full"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {createPayment.isPending ? "Processing..." : `Pay $${presetAmount}`}
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Create Payment
        </CardTitle>
        <CardDescription>
          Set up a one-time payment
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
          <Label htmlFor="payment-type">Payment Type</Label>
          <Select value={paymentType} onValueChange={(value) => setPaymentType(value as CreatePaymentData["payment_type"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="deposit">Security Deposit</SelectItem>
              <SelectItem value="fee">Fee</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="late_fee">Late Fee</SelectItem>
              <SelectItem value="application">Application Fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter payment description..."
            rows={2}
          />
        </div>

        <Button 
          onClick={handleCreatePayment}
          disabled={createPayment.isPending || !amount || Number(amount) <= 0}
          className="w-full"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {createPayment.isPending ? "Processing..." : `Create Payment`}
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