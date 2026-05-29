import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLAN_PRICE_IDS } from "@/lib/stripe";

export async function POST(request: Request) {
  const { planId } = await request.json();
  const priceId = PLAN_PRICE_IDS[planId];
  if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("current_organization_id").eq("user_id", user.id).single();
  let stripeCustomerId: string | undefined;

  if (profile?.current_organization_id) {
    const { data: org } = await supabase.from("organizations").select("stripe_customer_id").eq("id", profile.current_organization_id).single();
    stripeCustomerId = org?.stripe_customer_id ?? undefined;
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id, organization_id: profile?.current_organization_id ?? "" },
    });
    stripeCustomerId = customer.id;

    if (profile?.current_organization_id) {
      await supabase.from("organizations").update({ stripe_customer_id: stripeCustomerId }).eq("id", profile.current_organization_id);
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { user_id: user.id, plan_id: planId, organization_id: profile?.current_organization_id ?? "" },
    locale: "fr",
  });

  return NextResponse.json({ url: session.url });
}
