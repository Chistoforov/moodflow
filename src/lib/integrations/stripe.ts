import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function createCheckoutSession(
  userId: string,
  email: string,
  tier: 'subscription' | 'personal'
): Promise<string> {
  const prices = {
    subscription: process.env.STRIPE_PRICE_SUBSCRIPTION!,
    personal: process.env.STRIPE_PRICE_PERSONAL!,
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: prices[tier],
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    metadata: {
      userId,
      tier,
    },
  })

  return session.url!
}

export async function handleWebhook(
  payload: string,
  signature: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Обновить пользователя в БД
  console.log('Checkout completed:', session.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Продлить подписку
  console.log('Payment succeeded:', invoice.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Перевести на free tier
  console.log('Subscription deleted:', subscription.id)
}

export { stripe }

