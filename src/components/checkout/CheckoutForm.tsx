import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Plus, Trash2, User, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";

// Notice: We completely removed the UTR requirement!
const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Name required").max(100),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be 10 digits"),
  college: z.string().trim().min(2, "College required"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData & { teamMembers: string[] }) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CheckoutFormData>;
  totalAmount: number;
}

export const CheckoutForm = ({
  onSubmit,
  isLoading = false,
  defaultValues,
}: CheckoutFormProps) => {
  const { eventItems } = useCart();
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  const hasTeamEvents = eventItems.some(
    (item) => !item.teamSize.toLowerCase().includes("solo"),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultValues || {},
  });

  const handleFormSubmit = (data: CheckoutFormData) => {
    onSubmit({
      ...data,
      teamMembers: teamMembers.filter((n) => n.trim().length > 0),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 1. Participant Details */}
      <div className="glass-card rounded-xl p-6 border border-border/50 space-y-4">
        <h2 className="font-cinzel text-xl text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Participant Details
        </h2>

        <div className="space-y-1">
          <Input
            placeholder="Full Name"
            className={errors.fullName ? "border-destructive" : ""}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Email Address"
            className={errors.email ? "border-destructive" : ""}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="10-digit Phone"
            maxLength={10}
            className={errors.phone ? "border-destructive" : ""}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="College"
            className={errors.college ? "border-destructive" : ""}
            {...register("college")}
          />
          {errors.college && (
            <p className="text-xs text-destructive">{errors.college.message}</p>
          )}
        </div>
      </div>

      {/* 2. Team Members */}
      {hasTeamEvents && (
        <div className="glass-card rounded-xl p-6 border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-cinzel text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> Team Members
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTeamMembers([...teamMembers, ""])}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-2">
              Add your team members if required for your events.
            </p>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={member}
                    onChange={(e) => {
                      const newArr = [...teamMembers];
                      newArr[i] = e.target.value;
                      setTeamMembers(newArr);
                    }}
                    placeholder={`Member ${i + 1} Name`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setTeamMembers(teamMembers.filter((_, idx) => idx !== i))
                    }
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-white shadow-lg tracking-wide"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 w-5 h-5" /> Generating Secure
            QR...
          </>
        ) : (
          "Proceed to Payment"
        )}
      </Button>
    </form>
  );
};
