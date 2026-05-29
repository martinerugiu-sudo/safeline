import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLAN_PRICE_IDS: Record<string, string> = {
  sportif: process.env.STRIPE_PRICE_SPORTIF_MONTHLY!,
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  team: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
  "club-s": process.env.STRIPE_PRICE_CLUB_S_MONTHLY!,
  "club-l": process.env.STRIPE_PRICE_CLUB_L_MONTHLY!,
};

export const PLAN_BY_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_SPORTIF_MONTHLY!]: "sportif",
  [process.env.STRIPE_PRICE_PRO_MONTHLY!]: "pro",
  [process.env.STRIPE_PRICE_TEAM_MONTHLY!]: "team",
  [process.env.STRIPE_PRICE_CLUB_S_MONTHLY!]: "club-s",
  [process.env.STRIPE_PRICE_CLUB_L_MONTHLY!]: "club-l",
};
