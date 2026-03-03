import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().min(10, "Valid phone number is required").max(20),
  address: z.string().trim().min(5, "Delivery address is required").max(500),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link to="/marketplace">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutForm, string>> = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof CheckoutForm;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const refCode = localStorage.getItem("volt_ref_code") || null;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          email: result.data.email,
          name: result.data.name,
          phone: result.data.phone,
          address: result.data.address,
          city: result.data.city,
          state: result.data.state,
          total: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        commission_rate: item.commissionRate,
        ref_code: refCode,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Initiate Paystack payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-paystack-payment",
        {
          body: {
            orderId: order.id,
            email: result.data.email,
            amount: totalPrice,
          },
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.authorization_url) {
        clearCart();
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link to="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Continue Shopping
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold font-display">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Delivery form */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["name", "email", "phone", "address", "city", "state"] as const).map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field} className="capitalize">{field === "phone" ? "Phone Number" : field}</Label>
                  <Input
                    id={field}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    placeholder={
                      field === "name" ? "Full name" :
                      field === "email" ? "you@example.com" :
                      field === "phone" ? "08012345678" :
                      field === "address" ? "Street address" :
                      field === "city" ? "Lagos" :
                      "Lagos State"
                    }
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                  {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">{formatNaira(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatNaira(totalPrice)}</span>
              </div>
              <Button
                className="w-full volt-gradient h-12 text-base"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Pay {formatNaira(totalPrice)}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Secured by Paystack
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
