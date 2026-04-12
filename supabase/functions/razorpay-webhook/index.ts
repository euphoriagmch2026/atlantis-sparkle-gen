import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!signature || !WEBHOOK_SECRET)
      throw new Error("Missing signature or secret");

    // 1. Verify Razorpay Signature
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

    if (payload.event === "qr_code.credited") {
      const qrEntity = payload.payload.qr_code.entity;
      const customOrderId = qrEntity.notes.order_id;
      const paymentId = payload.payload.payment?.entity?.id || "N/A";

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      // 2. Update Database
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

      // 4. Send Custom Atlantis Email
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && orderData) {
        const formattedAmount = (orderData.total_amount / 100).toFixed(2);

        // Generate table rows for items
        const itemsList = orderData.order_items
          .map(
            (i: any) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px dashed #1e3a8a; color: #cbd5e1; font-size: 14px;">${i.item_name}</td>
              <td style="padding: 10px 0; border-bottom: 1px dashed #1e3a8a; color: #38bdf8; text-align: right; font-weight: bold;">x${i.quantity}</td>
            </tr>
          `,
          )
          .join("");

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
    body { margin: 0; padding: 0; background-color: #020617; color: #E2E8F0; font-family: 'Inter', sans-serif; }
    .email-container { width: 100%; max-width: 600px; margin: 40px auto; background: radial-gradient(circle at top, #0f172a 0%, #020617 100%); border: 1px solid #1e3a8a; border-radius: 16px; overflow: hidden; box-shadow: 0 0 30px rgba(56, 189, 248, 0.15); }
    .header-image { background-color: #0f172a; padding: 50px 20px; text-align: center; }
    .fest-title { font-family: 'Cinzel', serif; font-size: 42px; color: #38bdf8; margin: 0; text-shadow: 0 0 15px rgba(56, 189, 248, 0.6); letter-spacing: 3px; }
    .fest-subtitle { color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 5px; margin-top: 10px; }
    .content-body { padding: 40px 30px; text-align: center; }
    h2 { font-family: 'Cinzel', serif; color: #f8fafc; font-size: 24px; margin-top: 0; }
    .highlight { color: #00f2fe; font-weight: 600; }
    .order-table { width: 100%; margin: 30px 0; border-collapse: collapse; text-align: left; background: rgba(15, 23, 42, 0.5); padding: 15px; border-radius: 8px; }
    .footer { background-color: #020617; padding: 20px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid #0f172a; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-image">
      <h1 class="fest-title">EUPHORIA '26</h1>
      <div class="fest-subtitle">The Lost City of Atlantis</div>
    </div>
    <div class="content-body">
      <h2>Your Passage is Secured.</h2>
      <p>Greetings, <span class="highlight">${orderData.full_name}</span>. Your tribute has been accepted by the depths of <span class="highlight">Atlantis</span>.</p>
      
      <table class="order-table">
        ${itemsList}
        <tr>
          <td style="padding: 20px 0 0 0; color: #f8fafc; font-weight: bold; font-family: 'Cinzel', serif;">TOTAL PAID</td>
          <td style="padding: 20px 0 0 0; color: #00f2fe; text-align: right; font-weight: bold; font-size: 18px;">₹${formattedAmount}</td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #94a3b8;">Keep this digital scroll safe. Present Order ID <span style="color: #38bdf8;">#${customOrderId.substring(0, 8).toUpperCase()}</span> at the gates of GMCH Chandigarh.</p>
    </div>
    <div class="footer">
      <p>EUPHORIA 2026 • GMCH Chandigarh</p>
    </div>
  </div>
</body>
</html>`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Euphoria 2026 <hello@euphoria2026.com>",
            to: [orderData.email],
            subject: "Your Passage to Atlantis is Secured! 🔱",
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
