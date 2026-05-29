import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
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
