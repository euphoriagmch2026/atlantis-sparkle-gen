import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Package, Calendar, User as UserIcon } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface OrderItem {
  id: string;
  item_name: string;
  item_type: string;
  price: number;
  quantity: number;
}
interface Order {
  id: string;
  razorpay_order_id: string | null;
  full_name: string;
  email: string;
  college: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}
interface Profile {
  full_name: string | null;
  phone: string | null;
  college: string | null;
  avatar_url: string | null;
}

const statusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "created":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "failed":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      const [profileRes, ordersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, college, avatar_url")
          .eq("id", user.id)
          .single(),
        supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (ordersRes.data) setOrders(ordersRes.data as unknown as Order[]);
      setLoading(false);
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingParticles />
        <Navbar />
        <main className="relative pt-24 md:pt-28 pb-20 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Your Profile | EUPHORIA 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <FloatingParticles />
      <Navbar />
      <main className="relative pt-24 md:pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-8 text-glow">
            Profile & Orders
          </h1>

          <Card className="glass-card border-border/30 mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <UserIcon className="w-5 h-5 text-primary" /> Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="text-foreground font-medium">
                    {profile?.full_name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">
                    {user?.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="text-foreground font-medium">
                    {profile?.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">College</p>
                  <p className="text-foreground font-medium">
                    {profile?.college || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Order History
          </h2>

          {orders.length === 0 ? (
            <Card className="glass-card border-border/30">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No orders yet. Start exploring events!
                </p>
                <Button className="mt-4" onClick={() => navigate("/events")}>
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="glass-card border-border/30 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id,
                    )
                  }
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className={statusColor(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-foreground font-semibold">
                        ₹{(order.total_amount / 100).toFixed(2)}
                      </p>
                    </div>
                    {order.razorpay_order_id && (
                      <p className="text-xs text-muted-foreground font-mono mb-2">
                        Order: {order.razorpay_order_id}
                      </p>
                    )}
                    {expandedOrder === order.id &&
                      order.order_items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {item.item_name}{" "}
                                {item.quantity > 1 ? `×${item.quantity}` : ""}
                              </span>
                              <span className="text-foreground">
                                ₹
                                {((item.price * item.quantity) / 100).toFixed(
                                  2,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
