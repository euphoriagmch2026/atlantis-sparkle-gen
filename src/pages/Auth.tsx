import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/"); // Redirect to home after login
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-12 px-4">
        <div className="w-full max-w-md bg-card p-8 rounded-lg border border-border/50 shadow-xl">
          <h1 className="text-2xl font-cinzel font-bold text-center mb-6 text-glow">
            Join Euphoria
          </h1>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]} // Add 'google' here if you enable it in Supabase
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
