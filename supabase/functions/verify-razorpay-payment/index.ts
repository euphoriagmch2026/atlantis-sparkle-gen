import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VerifySchema = z.object({
  razorpay_order_id: z
    .string()
    .regex(/^order_[A-Za-z0-9]+$/, "Invalid order ID format"),
  razorpay_payment_id: z
    .string()
    .regex(/^pay_[A-Za-z0-9]+$/, "Invalid payment ID format"),
  razorpay_signature: z
    .string()
    .regex(/^[a-f0-9]{64}$/, "Invalid signature format"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret not configured");
    }

    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    // 1. Verify signature
    const encoder = new TextEncoder();
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(data),
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // 2. Update Database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError)
      throw new Error(`DB update failed: ${updateError.message}`);

    // ============================================================
    // 3. SEND CONFIRMATION EMAIL (This was missing in your code)
    // ============================================================
    try {
      // A. Fetch order details to populate the email
      const { data: orderData, error: fetchError } = await supabase
        .from("orders")
        .select(
          "email, full_name, total_amount, order_items(item_name, quantity)",
        )
        .eq("razorpay_order_id", razorpay_order_id)
        .single();

      if (orderData && !fetchError) {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

        if (RESEND_API_KEY) {
          // B. Create the email content
          const itemsList = orderData.order_items
            .map(
              (item: any) =>
                `<li><strong>${item.item_name}</strong> (x${item.quantity})</li>`,
            )
            .join("");

          const emailHtml = `
            <h1>Payment Confirmed!</h1>
            <p>Dear ${orderData.full_name},</p>
            <p>Thank you for registering for EUPHORIA 2026!</p>
            <h3>Order Summary:</h3>
            <ul>${itemsList}</ul>
            <p><strong>Total Paid:</strong> ₹${(orderData.total_amount / 100).toFixed(2)}</p>
            <p>Your Order ID: ${razorpay_order_id}</p>
          `;

          // C. Send via Resend API
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Euphoria Team <onboarding@resend.dev>", // Or your verified domain
              to: [orderData.email],
              subject: "Order Confirmation - EUPHORIA 2026",
              html: emailHtml,
            }),
          });
          console.log("Email sent successfully to", orderData.email);
        } else {
          console.warn("Skipping email: RESEND_API_KEY not found.");
        }
      }
    } catch (emailErr) {
      // We catch this so the payment doesn't fail if the email service is down
      console.error("Failed to send email:", emailErr);
    }
    // ============================================================

    return new Response(
      JSON.stringify({ verified: true, orderId: razorpay_order_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Verification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ verified: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
