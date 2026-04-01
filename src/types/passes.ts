export type PassTier = 'basic' | 'earlybird';
export type ItemType = 'pass' | 'event';

export interface CartItemBase {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: ItemType;
}

export interface PassCartItem extends CartItemBase {
  type: 'pass';
  tier: PassTier;
}

export interface EventCartItem extends CartItemBase {
  type: 'event';
  category: 'cultural' | 'gaming' | 'workshop';
  day: 1 | 2 | 3;
  teamSize: string;
}

export type CartItem = PassCartItem | EventCartItem;

export interface Pass {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  tier: PassTier;
}

// PASSES data is now fetched from the database. See src/pages/Passes.tsx.
