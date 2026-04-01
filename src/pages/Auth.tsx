import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Phone, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  college: z.string().trim().min(2, "College name is required").max(200),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "signin";
  const [activeTab, setActiveTab] = useState<"signin" | "register">(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyMessage, setShowVerifyMessage] = useState(false);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Register state
  const [regData, setRegData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", phone: "", college: "",
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail, password: signInPassword,
    });
    setIsLoading(false);
    if (error) {
      toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});
    const result = registerSchema.safeParse(regData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { fieldErrors[err.path[0] as string] = err.message; });
      setRegErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: {
        data: {
          full_name: regData.fullName,
          phone: regData.phone,
          college: regData.college,
        },
      },
    });
    setIsLoading(false);
    if (error) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } else {
      setShowVerifyMessage(true);
    }
  };

  if (showVerifyMessage) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32 pb-12 px-4">
          <div className="w-full max-w-md glass-card p-8 rounded-xl border border-border/50 text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-cinzel text-2xl font-bold text-foreground mb-4 text-glow">
              Check Your Email
            </h2>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <span className="text-primary">{regData.email}</span>. 
              Please verify your email before signing in.
            </p>
            <Button onClick={() => { setShowVerifyMessage(false); setActiveTab("signin"); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-12 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-xl border border-border/50 shadow-xl">
          <h1 className="text-2xl font-cinzel font-bold text-center mb-6 text-glow">
            Join Euphoria
          </h1>

          {/* Tabs */}
          <div className="flex mb-6 rounded-lg bg-secondary/50 p-1">
            {(["signin", "register"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                {tab === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                <Input type="email" placeholder="your.email@example.com" value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)} required
                  className="bg-secondary/30 border-border/50 focus:border-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Password</Label>
                <Input type="password" placeholder="••••••••" value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)} required
                  className="bg-secondary/30 border-border/50 focus:border-primary" />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Full Name</Label>
                <Input placeholder="Enter your full name" value={regData.fullName}
                  onChange={e => setRegData(d => ({ ...d, fullName: e.target.value }))}
                  className={cn("bg-secondary/30 border-border/50 focus:border-primary", regErrors.fullName && "border-destructive")} />
                {regErrors.fullName && <p className="text-sm text-destructive">{regErrors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                <Input type="email" placeholder="your.email@example.com" value={regData.email}
                  onChange={e => setRegData(d => ({ ...d, email: e.target.value }))}
                  className={cn("bg-secondary/30 border-border/50 focus:border-primary", regErrors.email && "border-destructive")} />
                {regErrors.email && <p className="text-sm text-destructive">{regErrors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Password</Label>
                  <Input type="password" placeholder="Min 6 chars" value={regData.password}
                    onChange={e => setRegData(d => ({ ...d, password: e.target.value }))}
                    className={cn("bg-secondary/30 border-border/50 focus:border-primary", regErrors.password && "border-destructive")} />
                  {regErrors.password && <p className="text-sm text-destructive">{regErrors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> Confirm</Label>
                  <Input type="password" placeholder="Repeat password" value={regData.confirmPassword}
                    onChange={e => setRegData(d => ({ ...d, confirmPassword: e.target.value }))}
                    className={cn("bg-secondary/30 border-border/50 focus:border-primary", regErrors.confirmPassword && "border-destructive")} />
                  {regErrors.confirmPassword && <p className="text-sm text-destructive">{regErrors.confirmPassword}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</Label>
                <Input type="tel" placeholder="10-digit number" maxLength={10} value={regData.phone}
                  onChange={e => setRegData(d => ({ ...d, phone: e.target.value }))}
                  className={cn("bg-secondary/30 border-border/50 focus:border-primary", regErrors.phone && "border-destructive")} />
                {regErrors.phone && <p className="text-sm text-destructive">{regErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> College</Label>
                <Input placeholder="Your college / organization" value={regData.college}
                  onChange={e => setRegData(d => ({ ...d, college: e.target.value }))}
                  className={cn("bg-secondary/30 border-border/50 focus:border-primary", regErrors.college && "border-destructive")} />
                {regErrors.college && <p className="text-sm text-destructive">{regErrors.college}</p>}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</> : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
