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

    // Get order details for email
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, name, email")
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

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

    const emailDetails: string[] = [];

    const fulfillmentPromises = orderItems.map(async (item) => {
      const product = item.products;
      if (!product) return;

      let deliveryDetails = null;
      let emailSnippet = `<h3>${product.name} (x${item.quantity})</h3>`;

      if (product.delivery_type === "direct_link") {
        deliveryDetails = {
          type: "link",
          url: product.assets?.fulfillment_url || "",
          message: "Here is your private access link.",
        };
        emailSnippet += `<p>Access Link: <a href="${deliveryDetails.url}">${deliveryDetails.url}</a></p>`;
      } else if (product.delivery_type === "license_key") {
        // Find an unused license key
        const { data: keys, error: keyError } = await supabaseAdmin
          .from("license_keys")
          .select("id, key_value")
          .eq("product_id", product.id)
          .eq("is_used", false)
          .limit(item.quantity);

        if (keyError) {
          console.error("Error fetching license key:", keyError);
          deliveryDetails = { type: "error", message: "Failed to allocate license key. Please contact support." };
          emailSnippet += `<p>Notice: Failed to allocate license key. Please contact support.</p>`;
        } else if (!keys || keys.length < item.quantity) {
          deliveryDetails = { type: "error", message: "Not enough license keys in stock. Support will issue yours shortly." };
          emailSnippet += `<p>Notice: Not enough keys in stock. Support will issue yours shortly.</p>`;
        } else {
          // Mark keys as used
          const keyIds = keys.map((k) => k.id);
          const { error: updateError } = await supabaseAdmin
            .from("license_keys")
            .update({ is_used: true, used_by_order_id: orderId })
            .in("id", keyIds);
          
          if (!updateError) {
            const keyVals = keys.map((k) => k.key_value);
            deliveryDetails = {
              type: "key",
              keys: keyVals,
              message: "Here are your license keys.",
            };
            emailSnippet += `<p>License Keys: <br/>${keyVals.join("<br/>")}</p>`;
          }
        }
      } else if (product.delivery_type === "manual_provision") {
        deliveryDetails = {
          type: "manual",
          instructions: product.delivery_instructions || "We will contact you shortly to set up your account.",
        };
        emailSnippet += `<p>Instructions: ${deliveryDetails.instructions}</p>`;
      }

      emailDetails.push(emailSnippet);

      // Update the order item with delivery details
      if (deliveryDetails) {
        await supabaseAdmin
          .from("order_items")
          .update({ delivery_details: deliveryDetails })
          .eq("id", item.id);
      }
    });

    await Promise.all(fulfillmentPromises);

    // Send email using Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY && order?.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your order, ${order.name || 'Customer'}! ⚡</h2>
          <p>Your order (ID: ${order.id}) has been processed. Here are your purchase details:</p>
          <hr />
          ${emailDetails.join("<br/>")}
          <hr />
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br/>Volt Team</p>
        </div>
      `;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Volt <hello@tryvoltapp.com>",
            to: [order.email],
            subject: "Your Volt Order Details ⚡",
            html: emailHtml,
          }),
        });

        if (!res.ok) {
          console.error("Resend API error:", await res.text());
        }
      } catch (emailErr) {
        console.error("Error sending order email:", emailErr);
      }
    }

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
