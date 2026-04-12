import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CartProvider } from "./contexts/CartContext";
import ScrollRecovery from "./components/ScrollRecovery";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PreEvents from "./pages/PreEvents";
import Contact from "./pages/Contact";
import Schedule from "./pages/Schedule";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/Cart";
import Profile from "./pages/Profile";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// --- NEW COMPONENT: Handles the email verification redirect ---
const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // If the user just signed in and the URL has an access token (like from a verification email)
      if (event === "SIGNED_IN" && location.hash.includes("access_token")) {
        // Remove the ugly hash and redirect to the profile page
        navigate("/profile", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  return null; // This is a logic-only component, it renders nothing visible
};
// --------------------------------------------------------------

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthStateHandler /> {/* Inject the handler here */}
          <ScrollRecovery />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pre-events" element={<PreEvents />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
