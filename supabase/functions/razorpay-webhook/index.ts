import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET"); // We will set this in Step 4

    if (!signature || !WEBHOOK_SECRET)
      throw new Error("Missing signature or secret");

    // 1. Verify Razorpay Signature securely
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(rawBody),
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== signature) throw new Error("Invalid signature");

    const payload = JSON.parse(rawBody);

    // Only process QR payments
    if (payload.event === "qr_code.credited") {
      const qrEntity = payload.payload.qr_code.entity;
      const customOrderId = qrEntity.notes.order_id; // The ID we sneaked in earlier!
      const paymentId = payload.payload.payment?.entity?.id || "N/A";

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      // 2. Update Database to Paid
      await supabase
        .from("orders")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId,
        })
        .eq("id", customOrderId);

      // 3. Fetch data for email
      const { data: orderData } = await supabase
        .from("orders")
        .select(
          "email, full_name, total_amount, order_items(item_name, quantity)",
        )
        .eq("id", customOrderId)
        .single();

      // 4. Send Email via Resend
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && orderData) {
        const itemsList = orderData.order_items
          .map(
            (i: any) =>
              `<tr><td style="padding: 10px 0; border-bottom: 1px dashed #1e293b; color: #e2e8f0;">${i.item_name}</td><td style="text-align: right; color: #38bdf8;">x${i.quantity}</td></tr>`,
          )
          .join("");

        const emailHtml = `
          <div style="background: #020617; color: white; padding: 30px; font-family: sans-serif; text-align: center;">
            <h1 style="color: #38bdf8;">EUPHORIA '26</h1>
            <h3>Your Passage is Secured, ${orderData.full_name}.</h3>
            <table style="width: 100%; margin-top: 20px; text-align: left; background: #0f172a; padding: 20px; border-radius: 8px;">
              ${itemsList}
              <tr><td style="padding-top: 20px; font-weight: bold;">Total Paid</td><td style="padding-top: 20px; text-align: right; font-weight: bold; color: #00f2fe;">₹${(orderData.total_amount / 100).toFixed(2)}</td></tr>
            </table>
          </div>
        `;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Euphoria 2026 <hello@euphoria2026.com>",
            to: [orderData.email],
            subject: "Tickets Verified! Welcome to EUPHORIA 2026 🔱",
            html: emailHtml,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});
