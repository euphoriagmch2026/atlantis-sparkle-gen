import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "Rtx@2026ti#") {
      setIsAuthenticated(true);
      fetchPending();
    } else toast({ title: "Access Denied", variant: "destructive" });
  };

  const fetchPending = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending");
    if (data) setOrders(data);
  };

  const verifyOrder = async (orderId: string) => {
    setProcessingId(orderId);
    const { error } = await supabase.functions.invoke("approve-order", {
      body: { orderId },
    });

    if (error) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Email sent!" });
      setOrders(orders.filter((o) => o.id !== orderId));
    }
    setProcessingId(null);
  };

  if (!isAuthenticated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Helmet>
          <title>Admin Login | EUPHORIA 2026</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <form onSubmit={handleLogin} className="glass-card p-8 rounded-xl">
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="mb-4"
          />
          <Button className="w-full">Login</Button>
        </form>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pt-32 px-4 max-w-5xl mx-auto">
      <Helmet>
        <title>Admin Dashboard | EUPHORIA 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <h1 className="text-3xl font-bold mb-8">Pending Verifications</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="glass-card p-6 rounded-xl border border-primary/20"
          >
            <h3 className="font-bold text-lg">{order.full_name}</h3>
            <p className="text-accent text-xl font-bold my-2">
              ₹{order.total_amount / 100}
            </p>
            <div className="bg-secondary/50 p-2 rounded mb-4 font-mono text-lg text-center">
              {order.razorpay_payment_id?.replace("UTR_", "")}
            </div>
            <Button
              onClick={() => verifyOrder(order.id)}
              disabled={processingId === order.id}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {processingId === order.id ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Verify & Send Ticket"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
