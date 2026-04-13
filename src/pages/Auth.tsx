import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if URL changes (e.g. clicking Register from Hero section)
  useEffect(() => {
    setIsSignUp(searchParams.get("tab") === "register");
  }, [searchParams]);

  const toggleAuthMode = () => {
    const newIsSignUp = !isSignUp;
    setIsSignUp(newIsSignUp);
    setSearchParams(newIsSignUp ? { tab: "register" } : {});
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({ 
          title: "Registration successful!", 
          description: "Please check your email to verify your account." 
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({ 
          title: "Welcome back!", 
          description: "You have successfully logged in." 
        });
        navigate("/profile"); // Redirect to profile after successful login
      }
    } catch (error: any) {
      toast({ 
        title: "Authentication Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Helmet>
        <title>{isSignUp ? "Register" : "Sign In"} | EUPHORIA 2026</title>
      </Helmet>
      
      <Navbar />

      <div className="flex-1 w-full flex items-center justify-center p-4 mt-20">
        <div className="w-full max-w-md glass-card p-8 rounded-xl border border-primary/20">
          <h1 className="text-3xl font-bold mb-6 text-center text-glow font-cinzel">
            {isSignUp ? "Join Atlantis" : "Welcome Back"}
          </h1>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-secondary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-secondary/50"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)]" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
              {isSignUp ? "Register" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
            >
              {isSignUp ? "Sign In" : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
