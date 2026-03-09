import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error("Missing orderId");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get order items and their products
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*, products(id, name, delivery_type, delivery_instructions, assets)")
      .eq("order_id", orderId);

    if (itemsError) throw itemsError;
    if (!orderItems || orderItems.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No items to fulfill" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fulfillmentPromises = orderItems.map(async (item) => {
      const product = item.products;
      if (!product) return;

      let deliveryDetails = null;

      if (product.delivery_type === "direct_link") {
        deliveryDetails = {
          type: "link",
          url: product.assets?.fulfillment_url || "",
          message: "Here is your private access link.",
        };
      } else if (product.delivery_type === "license_key") {
        // Find an unused license key
        const { data: keys, error: keyError } = await supabaseAdmin
          .from("license_keys")
          .select("id, key_value")
          .eq("product_id", product.id)
          .eq("is_used", false)
          .limit(item.quantity); // Need as many keys as quantity ordered

        if (keyError) {
          console.error("Error fetching license key:", keyError);
          deliveryDetails = { type: "error", message: "Failed to allocate license key. Please contact support." };
        } else if (!keys || keys.length < item.quantity) {
          deliveryDetails = { type: "error", message: "Not enough license keys in stock. Support will issue yours shortly." };
        } else {
          // Mark keys as used
          const keyIds = keys.map((k) => k.id);
          const { error: updateError } = await supabaseAdmin
            .from("license_keys")
            .update({ is_used: true, used_by_order_id: orderId })
            .in("id", keyIds);
          
          if (!updateError) {
            deliveryDetails = {
              type: "key",
              keys: keys.map((k) => k.key_value),
              message: "Here are your license keys.",
            };
          }
        }
      } else if (product.delivery_type === "manual_provision") {
        deliveryDetails = {
          type: "manual",
          instructions: product.delivery_instructions || "We will contact you shortly to set up your account.",
        };
      }

      // Update the order item with delivery details
      if (deliveryDetails) {
        await supabaseAdmin
          .from("order_items")
          .update({ delivery_details: deliveryDetails })
          .eq("id", item.id);
      }
    });

    await Promise.all(fulfillmentPromises);

    return new Response(JSON.stringify({ success: true, message: "Order fulfilled successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error in process-order-fulfillment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
