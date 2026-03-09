import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const body = await req.text();

    // Verify Paystack signature
    const signature = req.headers.get("x-paystack-signature");
    if (signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(paystackKey),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const hash = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (hash !== signature) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const orderId = metadata?.order_id;

      if (!orderId) {
        return new Response("No order_id in metadata", { status: 400 });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if order contains only digital products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, products(product_type)")
        .eq("order_id", orderId);

      const allDigital = orderItems?.every((item: any) => item.products?.product_type === "digital");

      // For digital orders, auto-confirm; for physical, mark as paid
      const newStatus = allDigital ? "confirmed" : "paid";

      await supabase
        .from("orders")
        .update({ status: newStatus, paystack_reference: reference })
        .eq("id", orderId);

      // Trigger digital fulfillment processing
      try {
        await supabase.functions.invoke("process-order-fulfillment", {
          body: { orderId }
        });
      } catch (fulfillmentErr) {
        console.error("Fulfillment trigger error:", fulfillmentErr);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
