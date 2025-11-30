import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, IndianRupee, Wallet } from "lucide-react";

type PaymentLocationState = {
  requestId?: string;
  days?: number;
  totalDue?: number;
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as PaymentLocationState;
  const days = state.days ?? 1;
  const total = Number(state.totalDue ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Wallet className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">Complete Payment</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Return Summary</CardTitle>
              <Badge variant="secondary">Request #{state.requestId?.slice(-6) || "—"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Days Borrowed</p>
                <p className="font-semibold">{days} day{days === 1 ? "" : "s"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Total Due</p>
                <p className="font-semibold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Choose a payment method</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button className="w-full" variant="default" onClick={() => alert("Please pay cash to the owner.")}>Cash</Button>
                <Button className="w-full" variant="outline" onClick={() => alert("Pay via UPI to: upi-id@okbank")}>UPI</Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Note: This demo shows the payable amount and lets you select Cash or UPI. Actual payment capture can be integrated later.
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => navigate("/my-requests")}>Done</Button>
              <Button className="flex-1" variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Payment;



