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

export const PASSES: Pass[] = [
  {
    id: 'basic-registration',
    name: 'Basic Registration (BR)',
    description: 'Get access to the fest grounds and experience the magic of EUPHORIA 2026.',
    price: 299,
    benefits: [
      'Entry to fest grounds',
      'Access to food court',
      'View cultural performances',
      'Participate in open events',
    ],
    tier: 'basic',
  },
  {
    id: 'early-bird-all-night',
    name: 'Early Bird All Night Pass',
    description: 'The ultimate night experience with exclusive access to pro shows and after-parties.',
    price: 999,
    benefits: [
      'All Basic Registration benefits',
      'Priority entry to pro shows',
      'Access to all night events',
      'Exclusive after-party access',
      'Early bird discount pricing',
      'Complimentary refreshments',
    ],
    tier: 'earlybird',
  },
];
