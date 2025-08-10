import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVerifyPayment } from "@/hooks/queries/usePayments";
import { CheckCircle, XCircle, Loader2, Home, Receipt } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  
  const verifyPayment = useVerifyPayment();

  useEffect(() => {
    if (sessionId && !verificationAttempted) {
      setVerificationAttempted(true);
      verifyPayment.mutate(sessionId);
    }
  }, [sessionId, verificationAttempted, verifyPayment]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <CardTitle>Invalid Payment Session</CardTitle>
            <CardDescription>
              No payment session found. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyPayment.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary mb-4" />
            <CardTitle>Verifying Payment</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (verifyPayment.isError || (verifyPayment.data && !verifyPayment.data.success)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <CardTitle>Payment Verification Failed</CardTitle>
            <CardDescription>
              {verifyPayment.data?.error || "We couldn't verify your payment. Please contact support."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-sm text-muted-foreground">
              Session ID: {sessionId}
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              <Button asChild>
                <Link to="/support">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSubscription = verifyPayment.data?.type === "subscription";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <CardTitle>
            {isSubscription ? "Subscription Active!" : "Payment Successful!"}
          </CardTitle>
          <CardDescription>
            {isSubscription 
              ? "Your subscription has been activated and you'll be billed automatically."
              : "Your payment has been processed successfully."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm text-muted-foreground">Payment Details:</div>
            <div className="text-sm">
              <strong>Session ID:</strong> {sessionId.slice(0, 20)}...
            </div>
            <div className="text-sm">
              <strong>Status:</strong> {verifyPayment.data?.payment_status || verifyPayment.data?.subscription_status}
            </div>
            <div className="text-sm">
              <strong>Type:</strong> {isSubscription ? "Recurring Subscription" : "One-time Payment"}
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/payments">
                <Receipt className="w-4 h-4 mr-2" />
                View Payments
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}