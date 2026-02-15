import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Strict Zod validation
const CartItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["pass", "event"]),
  quantity: z.number().int().min(1).max(20),
});

const UserDetailsSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  college: z.string().trim().min(2).max(200),
  teamMembers: z.array(z.string().trim().max(100)).max(20).default([]),
});

const OrderRequestSchema = z.object({
  cartItems: z.array(CartItemSchema).min(1, "Cart is empty").max(50),
  userDetails: UserDetailsSchema,
});

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

    // Validate input with Zod
    const body = await req.json();
    const parsed = OrderRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { cartItems, userDetails } = parsed.data;

    // Supabase client with service role for server-side pricing
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ---- SERVER-SIDE PRICING: Fetch real prices from DB ----
    const passIds = cartItems.filter(i => i.type === "pass").map(i => i.id);
    const eventIds = cartItems.filter(i => i.type === "event").map(i => i.id);

    let passesMap: Record<string, { price: number; name: string }> = {};
    let eventsMap: Record<string, { fee: number; name: string }> = {};

    if (passIds.length > 0) {
      const { data: passRows, error: pErr } = await supabase
        .from("passes")
        .select("id, name, price")
        .in("id", passIds);
      if (pErr) throw new Error(`Failed to fetch passes: ${pErr.message}`);
      for (const p of passRows || []) {
        passesMap[p.id] = { price: p.price, name: p.name };
      }
    }

    if (eventIds.length > 0) {
      const { data: eventRows, error: eErr } = await supabase
        .from("events")
        .select("id, name, fee")
        .in("id", eventIds);
      if (eErr) throw new Error(`Failed to fetch events: ${eErr.message}`);
      for (const e of eventRows || []) {
        eventsMap[e.id] = { fee: e.fee, name: e.name };
      }
    }

    // Build line items with server-side prices and calculate total
    const lineItems: { id: string; type: string; name: string; priceRupees: number; quantity: number }[] = [];
    let totalPaise = 0;

    for (const item of cartItems) {
      if (item.type === "pass") {
        const pass = passesMap[item.id];
        if (!pass) throw new Error(`Pass not found: ${item.id}`);
        lineItems.push({ id: item.id, type: "pass", name: pass.name, priceRupees: pass.price, quantity: item.quantity });
        totalPaise += pass.price * item.quantity * 100;
      } else {
        const ev = eventsMap[item.id];
        if (!ev) throw new Error(`Event not found: ${item.id}`);
        lineItems.push({ id: item.id, type: "event", name: ev.name, priceRupees: ev.fee, quantity: item.quantity });
        totalPaise += ev.fee * item.quantity * 100;
      }
    }

    if (totalPaise <= 0) throw new Error("Total amount must be greater than 0");

    // Create Razorpay order
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: totalPaise,
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

    // Store order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: razorpayOrder.id,
        full_name: userDetails.fullName,
        email: userDetails.email,
        phone: userDetails.phone,
        college: userDetails.college,\
        user_id: userDetails.userId, 
        team_members: userDetails.teamMembers.filter(m => m.length > 0),
        total_amount: totalPaise,
        status: "created",
      })
      .select("id")
      .single();

    if (orderError) throw new Error(`DB insert failed: ${orderError.message}`);

    // Insert order items with server-side prices
    const orderItemsData = lineItems.map((item) => ({
      order_id: order.id,
      item_type: item.type,
      item_id: item.id,
      item_name: item.name,
      price: item.priceRupees * 100, // store in paise
      quantity: item.quantity,
      metadata: {},
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) throw new Error(`Order items insert failed: ${itemsError.message}`);

    return new Response(
      JSON.stringify({
        orderId: razorpayOrder.id,
        amount: totalPaise,
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
