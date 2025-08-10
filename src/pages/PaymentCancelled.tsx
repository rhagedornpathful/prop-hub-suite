import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, CreditCard } from "lucide-react";

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled and no charges were made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            You can try again at any time. If you encountered any issues, please contact our support team.
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/payments">
                <CreditCard className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}