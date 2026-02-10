import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import ScrollRecovery from "./components/ScrollRecovery"; // New import
import Index from "./pages/Index";
import Passes from "./pages/Passes";
import Events from "./pages/Events";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/Cart"; // New import
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollRecovery /> {/* Mount failsafe here */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/passes" element={<Passes />} />
            <Route path="/events" element={<Events />} />
            <Route path="/cart" element={<CartPage />} /> {/* New route */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
