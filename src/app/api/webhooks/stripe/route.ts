import { NextResponse } from "next/server";
import { stripe, PLAN_BY_PRICE } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organization_id;
      const planId = session.metadata?.plan_id;
      if (orgId && planId) {
        await supabase.from("organizations").update({
          subscription_tier: planId,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
        }).eq("id", orgId);
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const tier = PLAN_BY_PRICE[priceId] ?? "free";
      const customerId = sub.customer as string;
      if (sub.status === "active" || sub.status === "trialing") {
        await supabase.from("organizations").update({ subscription_tier: tier }).eq("stripe_customer_id", customerId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from("organizations").update({ subscription_tier: "free", stripe_subscription_id: null }).eq("stripe_customer_id", sub.customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
