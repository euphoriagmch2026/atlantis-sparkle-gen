import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  if (!record || now > record.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

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

  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({
        verified: false,
        error: "Rate limit exceeded. Try again later.",
      }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
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
                `<div style="padding: 10px 0; border-bottom: 1px solid rgba(56, 189, 248, 0.2); display: flex; justify-content: space-between;">
                   <span style="color: #E2E8F0; font-weight: 600;">${item.item_name}</span>
                   <span style="color: #94a3b8;">x${item.quantity}</span>
                 </div>`,
            )
            .join("");

          const emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
                body { margin: 0; padding: 20px; background-color: #020617; color: #E2E8F0; font-family: 'Inter', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e3a8a; border-radius: 16px; overflow: hidden; box-shadow: 0 0 30px rgba(56, 189, 248, 0.15); }
                .header { background-image: linear-gradient(to bottom, rgba(2,6,23,0.4), rgba(2,6,23,1)), url('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=600&auto=format&fit=crop'); background-size: cover; background-position: center; padding: 40px 20px; text-align: center; }
                .title { font-family: 'Cinzel', serif; font-size: 36px; color: #38bdf8; margin: 0; text-shadow: 0 0 15px rgba(56, 189, 248, 0.6); letter-spacing: 2px; }
                .subtitle { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-top: 8px; }
                .body { padding: 40px 30px; }
                h2 { font-family: 'Cinzel', serif; color: #f8fafc; font-size: 22px; margin-top: 0; text-align: center; }
                p { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
                .receipt-box { background: rgba(2, 6, 23, 0.6); border: 1px solid #1e3a8a; border-radius: 12px; padding: 25px; margin: 30px 0; }
                .total-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 2px solid #38bdf8; font-size: 18px; font-weight: bold; color: #00f2fe; }
                .order-id { text-align: center; font-size: 12px; color: #64748b; margin-top: 30px; font-family: monospace; }
                .footer { background-color: #020617; padding: 20px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid #1e3a8a; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="title">EUPHORIA '26</h1>
                  <div class="subtitle">Payment Confirmed</div>
                </div>
                <div class="body">
                  <h2>Your Passage is Secured.</h2>
                  <p>Greetings, <strong>${orderData.full_name}</strong>,</p>
                  <p>The gates of Atlantis recognize your contribution. Your registration for the following events has been officially confirmed.</p>
                  
                  <div class="receipt-box">
                    <h3 style="margin-top: 0; font-family: 'Cinzel', serif; color: #38bdf8; border-bottom: 1px solid #1e3a8a; padding-bottom: 10px;">Order Summary</h3>
                    ${itemsList}
                    <div class="total-row">
                      <span>Total Paid:</span>
                      <span>₹${(orderData.total_amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <p style="text-align: center; color: #94a3b8;">Present this receipt or your registered email at the entry gates.</p>
                  <div class="order-id">Transaction Ref: ${razorpay_order_id}</div>
                </div>
                <div class="footer">
                  EUPHORIA 2026 • The Lost City of Atlantis • GMCH Chandigarh
                </div>
              </div>
            </body>
            </html>
          `;
          // C. Send via Resend API
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Euphoria 2026 <orders@euphoria2026.com>", // UPDATE THIS LINE
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
