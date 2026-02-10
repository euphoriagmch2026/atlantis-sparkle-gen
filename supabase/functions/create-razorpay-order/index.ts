import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "pass" | "event";
  metadata?: Record<string, unknown>;
}

interface OrderRequest {
  cartItems: CartItem[];
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    college: string;
    teamMembers: string[];
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }

    const { cartItems, userDetails }: OrderRequest = await req.json();

    // Validate
    if (!cartItems?.length) throw new Error("Cart is empty");
    if (!userDetails?.fullName || !userDetails?.email || !userDetails?.phone || !userDetails?.college) {
      throw new Error("Missing required user details");
    }

    // Calculate total in paise
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity * 100,
      0
    );

    // Create Razorpay order
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          full_name: userDetails.fullName,
          email: userDetails.email,
          college: userDetails.college,
        },
      }),
    });

    if (!razorpayRes.ok) {
      const errBody = await razorpayRes.text();
      throw new Error(`Razorpay order creation failed [${razorpayRes.status}]: ${errBody}`);
    }

    const razorpayOrder = await razorpayRes.json();

    // Store order in DB using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: razorpayOrder.id,
        full_name: userDetails.fullName,
        email: userDetails.email,
        phone: userDetails.phone,
        college: userDetails.college,
        team_members: userDetails.teamMembers || [],
        total_amount: totalAmount,
        status: "created",
      })
      .select("id")
      .single();

    if (orderError) throw new Error(`DB insert failed: ${orderError.message}`);

    // Insert order items
    const orderItemsData = cartItems.map((item) => ({
      order_id: order.id,
      item_type: item.type,
      item_id: item.id,
      item_name: item.name,
      price: item.price * 100,
      quantity: item.quantity,
      metadata: item.metadata || {},
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) throw new Error(`Order items insert failed: ${itemsError.message}`);

    return new Response(
      JSON.stringify({
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
        keyId: RAZORPAY_KEY_ID,
        dbOrderId: order.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
