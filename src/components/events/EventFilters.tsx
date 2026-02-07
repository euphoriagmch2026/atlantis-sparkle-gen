import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventFiltersProps {
  selectedCategory: string;
  selectedDay: number | null;
  selectedTeamType: string;
  onCategoryChange: (category: string) => void;
  onDayChange: (day: number | null) => void;
  onTeamTypeChange: (type: string) => void;
}

const categories = [
  { id: 'all', label: 'All Events' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'technical', label: 'Technical' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'workshop', label: 'Workshops' },
];

const days = [
  { id: null, label: 'All Days' },
  { id: 1, label: 'Day 1' },
  { id: 2, label: 'Day 2' },
  { id: 3, label: 'Day 3' },
];

const teamTypes = [
  { id: 'all', label: 'All' },
  { id: 'solo', label: 'Solo' },
  { id: 'team', label: 'Team' },
];

export const EventFilters = ({
  selectedCategory,
  selectedDay,
  selectedTeamType,
  onCategoryChange,
  onDayChange,
  onTeamTypeChange,
}: EventFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div>
        <h4 className="text-sm text-muted-foreground mb-3 tracking-wider uppercase">Category</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "border-border/50 transition-all duration-300",
                selectedCategory === cat.id
                  ? "bg-primary/20 border-primary text-primary"
                  : "hover:border-primary/50 hover:text-primary"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Day filters */}
      <div>
        <h4 className="text-sm text-muted-foreground mb-3 tracking-wider uppercase">Day</h4>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <Button
              key={day.id ?? 'all'}
              variant="outline"
              size="sm"
              onClick={() => onDayChange(day.id)}
              className={cn(
                "border-border/50 transition-all duration-300",
                selectedDay === day.id
                  ? "bg-accent/20 border-accent text-accent"
                  : "hover:border-accent/50 hover:text-accent"
              )}
            >
              {day.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Team type filters */}
      <div>
        <h4 className="text-sm text-muted-foreground mb-3 tracking-wider uppercase">Team Size</h4>
        <div className="flex flex-wrap gap-2">
          {teamTypes.map((type) => (
            <Button
              key={type.id}
              variant="outline"
              size="sm"
              onClick={() => onTeamTypeChange(type.id)}
              className={cn(
                "border-border/50 transition-all duration-300",
                selectedTeamType === type.id
                  ? "bg-coral/20 border-coral text-coral"
                  : "hover:border-coral/50 hover:text-coral"
              )}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
