import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    console.log("1. Starting QR Generation Process...");
    const { checkoutData, cartItems, totalAmount } = await req.json();

    const RAZORPAY_KEY = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY || !RAZORPAY_SECRET) {
      throw new Error("Missing Razorpay Keys in Edge Function Secrets");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // FIX: Generate a true database-safe UUID instead of 'ORD_123'
    const customOrderId = crypto.randomUUID();
    console.log("2. Generated UUID:", customOrderId);

    // Request Dynamic QR from Razorpay API
    const authHeader = "Basic " + btoa(`${RAZORPAY_KEY}:${RAZORPAY_SECRET}`);

    console.log("3. Calling Razorpay API...");
    const qrResponse = await fetch(
      "https://api.razorpay.com/v1/payments/qr_codes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          type: "upi_qr",
          name: "EUPHORIA 2026",
          usage: "single_use",
          fixed_amount: true,
          payment_amount: totalAmount * 100,
          description: "Fest Registration",
          notes: { order_id: customOrderId },
          close_by: Math.floor(Date.now() / 1000) + 15 * 60,
        }),
      },
    );

    const qrData = await qrResponse.json();

    if (!qrResponse.ok) {
      console.error("RAZORPAY ERROR RESPONSE:", qrData);
      throw new Error(
        qrData.error?.description || "Failed to generate QR with Razorpay",
      );
    }

    console.log("4. Razorpay QR Generated successfully. Saving to Database...");

    // Save to Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        id: customOrderId, // Now using a safe UUID
        email: checkoutData.email,
        full_name: checkoutData.fullName,
        phone: checkoutData.phone,
        college: checkoutData.college,
        team_members: checkoutData.teamMembers,
        total_amount: totalAmount * 100,
        status: "pending",
        razorpay_order_id: qrData.id,
      })
      .select()
      .single();

    if (orderError) {
      console.error("SUPABASE ORDER INSERT ERROR:", orderError);
      throw orderError;
    }

    // Insert order items
    const items = cartItems.map((item: any) => ({
      order_id: customOrderId,
      item_id: item.id,
      item_name: item.name,
      item_type: item.type,
      price: item.price * 100,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      console.error("SUPABASE ITEMS INSERT ERROR:", itemsError);
      throw itemsError;
    }

    console.log("5. Database save complete! Sending to frontend.");

    return new Response(
      JSON.stringify({ qrUrl: qrData.image_url, orderId: customOrderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    // CRITICAL: We actually log the error to the console now!
    console.error("🔥🔥🔥 EDGE FUNCTION CRASHED:", error.message);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
