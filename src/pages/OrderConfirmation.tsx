import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingCart, XCircle } from "lucide-react";
import { ReviewPrompt } from "@/components/ReviewPrompt";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const status = searchParams.get("status") || "success";
  const productIds = searchParams.get("products")?.split(",").filter(Boolean) || [];

  const isSuccess = status !== "failed";

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-6">
      <Card>
        <CardContent className="pt-8 pb-8 space-y-4">
          {isSuccess ? (
            <>
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <h1 className="text-2xl font-bold font-display">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
              {reference && (
                <p className="text-xs text-muted-foreground">
                  Reference: <span className="font-mono">{reference}</span>
                </p>
              )}
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold font-display">Payment Failed</h1>
              <p className="text-muted-foreground">
                Something went wrong with your payment. Please try again.
              </p>
            </>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Button asChild className="volt-gradient">
              <Link to="/marketplace">
                <ShoppingCart className="h-4 w-4 mr-2" /> Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Create an Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review prompt after successful purchase */}
      {isSuccess && productIds.length > 0 && (
        <ReviewPrompt productIds={productIds} />
      )}
    </div>
  );
};

export default OrderConfirmation;
