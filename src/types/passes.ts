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
  category: 'cultural' | 'sports' | 'workshop';
  day: 1 | 2 | 3;
  teamSize: string;
}

export type CartItem = PassCartItem | EventCartItem;
