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
    const { orderId } = await req.json();
    if (!orderId) throw new Error("Order ID required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Update status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);
    if (updateError) throw updateError;

    // Fetch data for email
    const { data: orderData } = await supabase
      .from("orders")
      .select(
        "email, full_name, total_amount, razorpay_order_id, order_items(item_name, quantity)",
      )
      .eq("id", orderId)
      .single();

    // Send Email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      // Build the receipt items using strict HTML table rows for flawless email client support
      const itemsList = orderData.order_items
        .map(
          (item: any) => `
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px dashed #1e293b; color: #e2e8f0; font-size: 15px;">
              ${item.item_name}
            </td>
            <td style="padding: 14px 0; border-bottom: 1px dashed #1e293b; color: #38bdf8; font-weight: 600; text-align: right;">
              x${item.quantity}
            </td>
          </tr>
        `,
        )
        .join("");

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600&display=swap');
    body { margin: 0; padding: 0; background-color: #030712; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #030712; padding: 40px 10px; box-sizing: border-box; }
    .main { background-color: #0b1120; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 10px 50px -10px rgba(56, 189, 248, 0.15); overflow: hidden; }
    .header { background: url('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=600&auto=format&fit=crop') no-repeat center center; background-size: cover; position: relative; text-align: center; padding: 70px 20px; }
    .header-overlay { background: linear-gradient(to bottom, rgba(11, 17, 32, 0.3), #0b1120); position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
    .header-content { position: relative; z-index: 1; }
    .title { font-family: 'Cinzel', serif; font-size: 46px; font-weight: 700; color: #bae6fd; margin: 0; text-shadow: 0 0 25px rgba(56, 189, 248, 0.8); letter-spacing: 5px; }
    .subtitle { font-size: 13px; font-weight: 600; color: #38bdf8; text-transform: uppercase; letter-spacing: 8px; margin-top: 12px; }
    .content { padding: 40px 40px 20px; color: #94a3b8; line-height: 1.7; font-size: 16px; text-align: center; }
    h2 { font-family: 'Cinzel', serif; color: #f8fafc; font-size: 26px; font-weight: 500; margin: 0 0 20px 0; }
    .highlight { color: #f8fafc; font-weight: 600; }
    .receipt-card { background: linear-gradient(145deg, #0f172a, #0b1120); border: 1px solid #1e293b; border-radius: 12px; padding: 35px 30px; margin: 35px 0; text-align: left; }
    .receipt-title { font-family: 'Cinzel', serif; color: #38bdf8; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 25px 0; text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 15px; }
    .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .total-row td { padding-top: 25px !important; border-bottom: none !important; font-size: 20px; font-weight: 700; color: #f8fafc; }
    .total-amount { text-align: right; color: #00f2fe !important; text-shadow: 0 0 15px rgba(0, 242, 254, 0.4); }
    .order-id { text-align: center; font-family: monospace; font-size: 13px; color: #64748b; margin-top: 35px; background-color: #030712; padding: 12px; border-radius: 8px; border: 1px dashed #1e293b; letter-spacing: 1px; }
    .footer { background-color: #030712; padding: 30px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid #0f172a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      
      <div class="header">
        <div class="header-overlay"></div>
        <div class="header-content">
          <h1 class="title">EUPHORIA</h1>
          <div class="subtitle">Official Pass</div>
        </div>
      </div>

      <div class="content">
        <h2>Your Passage is Secured</h2>
        <p>Greetings, <span class="highlight">${orderData.full_name}</span>.</p>
        <p>The gates of Atlantis recognize your contribution. Your payment has been officially verified by our finance council, and your registration is complete.</p>
        
        <div class="receipt-card">
          <h3 class="receipt-title">Order Summary</h3>
          <table class="receipt-table">
            ${itemsList}
            <tr class="total-row">
              <td>Total Paid</td>
              <td class="total-amount">₹${(orderData.total_amount / 100).toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">Present this VIP receipt or your registered email at the entry gates.</p>
        
        <div class="order-id">
          TXN REF: ${orderData.razorpay_order_id}
        </div>
      </div>

      <div class="footer">
        <p>EUPHORIA 2026 • THE LOST CITY OF ATLANTIS</p>
        <p>GMCH Chandigarh</p>
      </div>

    </div>
  </div>
</body>
</html>
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
          subject: "Your Passes are Ready! Welcome to EUPHORIA 2026 🔱",
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
