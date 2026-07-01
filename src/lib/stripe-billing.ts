import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export type StripeCheckoutSyncStatus = "synced" | "not_complete" | "invalid_user" | "missing_subscription";

export function activePlan(status: string | null | undefined) {
  return status === "active" || status === "trialing" ? "PREMIUM" : "FREE";
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = subscription.metadata?.userId;
  const data = {
    plan: activePlan(subscription.status) as "FREE" | "PREMIUM",
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
  };

  if (userId) {
    await prisma.user.update({ where: { id: userId }, data });
    return;
  }

  await prisma.user.updateMany({ where: { stripeCustomerId: customerId }, data });
}

export async function syncStripeCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!userId || !customerId || !subscriptionId) return false;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "PREMIUM",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
  });
  return true;
}

export async function syncStripeCheckoutSessionById(sessionId: string, userId: string): Promise<StripeCheckoutSyncStatus> {
  const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });

  if (session.metadata?.userId !== userId) return "invalid_user";
  if (session.mode !== "subscription" || session.status !== "complete") return "not_complete";

  const synced = await syncStripeCheckoutSession(session);
  return synced ? "synced" : "missing_subscription";
}
