import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Plus, Trash2, User, Mail, Phone, Building, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be less than 255 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  college: z.string().trim().min(2, 'College name is required').max(200, 'College name must be less than 200 characters'),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData & { teamMembers: string[] }) => void;
  isLoading?: boolean;
}

export const CheckoutForm = ({ onSubmit, isLoading = false }: CheckoutFormProps) => {
  const { eventItems } = useCart();
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  
  // Check if any team events are in the cart
  const hasTeamEvents = eventItems.some(item => {
    const teamSizeLower = item.teamSize.toLowerCase();
    return !teamSizeLower.includes('solo');
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
  });

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, '']);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, value: string) => {
    setTeamMembers(prev => prev.map((member, i) => i === index ? value : member));
  };

  const handleFormSubmit = (data: CheckoutFormData) => {
    // Filter out empty team member names
    const validTeamMembers = teamMembers.filter(name => name.trim().length > 0);
    onSubmit({ ...data, teamMembers: validTeamMembers });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="glass-card rounded-xl p-6 border border-border/50">
        <h2 className="font-cinzel text-xl text-foreground mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Participant Details
        </h2>

        <div className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              className={cn(
                'bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary',
                errors.fullName && 'border-destructive focus:border-destructive'
              )}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className={cn(
                'bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary',
                errors.email && 'border-destructive focus:border-destructive'
              )}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              className={cn(
                'bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary',
                errors.phone && 'border-destructive focus:border-destructive'
              )}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* College */}
          <div className="space-y-2">
            <Label htmlFor="college" className="text-muted-foreground flex items-center gap-2">
              <Building className="w-4 h-4" />
              College / Organization
            </Label>
            <Input
              id="college"
              placeholder="Enter your college or organization"
              className={cn(
                'bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary',
                errors.college && 'border-destructive focus:border-destructive'
              )}
              {...register('college')}
            />
            {errors.college && (
              <p className="text-sm text-destructive">{errors.college.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Team Members Section - Only show if team events in cart */}
      {hasTeamEvents && (
        <div className="glass-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel text-lg text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Team Members
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTeamMember}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Member
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Add your team members for team-based events. You can add their details here.
          </p>

          {teamMembers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground/60 text-sm">
              No team members added yet
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={member}
                    onChange={(e) => updateTeamMember(index, e.target.value)}
                    placeholder={`Team member ${index + 1} name`}
                    className="bg-secondary/30 border-border/50 focus:border-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamMember(index)}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Proceed to Pay'
        )}
      </Button>
    </form>
  );
};
