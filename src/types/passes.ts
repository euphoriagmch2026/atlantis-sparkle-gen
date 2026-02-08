export type PassTier = 'general' | 'day' | 'proshow' | 'vip';

export interface Pass {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  tier: PassTier;
}

export interface CartItem {
  passId: string;
  passName: string;
  price: number;
  quantity: number;
  tier: PassTier;
}

export const PASSES: Pass[] = [
  {
    id: 'general-fest',
    name: 'General Fest Pass',
    description: 'Experience the full magic of EUPHORIA 2026 with access to all cultural events and activities.',
    price: 499,
    benefits: [
      'Access to all cultural events',
      'Gaming zone entry',
      'Food court access',
      'Event merchandise discounts',
    ],
    tier: 'general',
  },
  {
    id: 'day-pass',
    name: 'Day Pass',
    description: 'Perfect for a single day of underwater adventures and memorable experiences.',
    price: 199,
    benefits: [
      'Single day access',
      'Select cultural events',
      'Food court access',
    ],
    tier: 'day',
  },
  {
    id: 'proshow-pass',
    name: 'Pro Show Pass',
    description: 'Get the ultimate concert experience with premium seating and exclusive backstage access.',
    price: 1499,
    benefits: [
      'VIP seating at pro shows',
      'Meet & greet access',
      'Exclusive merchandise',
      'Priority entry to all events',
    ],
    tier: 'proshow',
  },
  {
    id: 'vip-pass',
    name: 'VIP Pass',
    description: 'The ultimate EUPHORIA experience with all-access privileges and exclusive perks.',
    price: 2999,
    benefits: [
      'All-access pass to every event',
      'Priority entry everywhere',
      'Exclusive VIP lounge access',
      'Premium goodies bag',
      'Complimentary refreshments',
      'Personal concierge service',
    ],
    tier: 'vip',
  },
];
