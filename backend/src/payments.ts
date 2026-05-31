import express from 'express';
import Stripe from 'stripe';
import { initDb } from './db.js';
import { verifyToken } from './auth.js';

const router = express.Router();
const db = initDb();

// Helper to get Stripe instance with DB keys
const getStripe = async () => {
  return new Promise<Stripe>((resolve, reject) => {
    db.get("SELECT value FROM settings WHERE key = 'stripe_secret_key'", (err: any, row: any) => {
      if (err) return reject(err);
      const secret = row?.value || process.env.STRIPE_SECRET_KEY;
      if (!secret) return reject(new Error('Stripe secret key not found'));
      resolve(new Stripe(secret));
    });
  });
};

// Create checkout session for subscription
router.post('/create-checkout-session', verifyToken, async (req: any, res) => {
  const userId = req.userId;
  const { plan } = req.body;
  const origin = req.headers.origin || 'https://investia.ddev.site';

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Investia Premium',
              description: 'Acceso total a la plataforma',
            },
            unit_amount: 1900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: userId.toString(),
      metadata: { userId: userId.toString() }
    });

    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create setup session for adding payment method
router.post('/create-setup-session', verifyToken, async (req: any, res) => {
  const userId = req.userId;
  const origin = req.headers.origin || 'https://investia.ddev.site';

  try {
    const stripe = await getStripe();
    
    // Attempt to fetch existing customer ID
    const user = await new Promise<any>((resolve, reject) => {
      db.get('SELECT stripe_customer_id, email FROM users WHERE id = ?', [userId], (err, row) => err ? reject(err) : resolve(row));
    });

    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId: userId.toString() }
      });
      customerId = customer.id;
      db.run('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, userId]);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customerId,
      success_url: `${origin}/profile?setup_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/profile`,
      client_reference_id: userId.toString(),
    });

    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Verify session (Setup or Subscription)
router.get('/verify-session/:sessionId', verifyToken, async (req: any, res) => {
  const { sessionId } = req.params;
  const userId = req.userId;

  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['setup_intent.payment_method'] });
    
    if (session.mode === 'setup' && session.setup_intent) {
      const setupIntent = session.setup_intent as Stripe.SetupIntent;
      if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        const pm = setupIntent.payment_method as Stripe.PaymentMethod;
        if (pm.card) {
          db.run(
            'UPDATE users SET card_last4 = ?, card_exp_month = ?, card_exp_year = ?, card_brand = ? WHERE id = ?',
            [pm.card.last4, pm.card.exp_month.toString(), pm.card.exp_year.toString(), pm.card.brand, userId],
            (err) => {
              if (err) return res.status(500).json({ message: 'Error saving card details' });
              res.json({ success: true, message: 'Payment method saved successfully', isSetup: true });
            }
          );
        } else {
           res.status(400).json({ message: 'No card details found in payment method' });
        }
      } else {
        res.status(400).json({ message: 'Setup intent not successful' });
      }
    } else if (session.mode === 'subscription' && session.payment_status === 'paid' && session.metadata?.userId === userId.toString()) {
      // Update user to premium
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

      db.run(
        'UPDATE users SET subscription_status = ?, subscription_expiry = ?, stripe_customer_id = ? WHERE id = ?',
        ['premium', expiryDate.toISOString(), session.customer as string, userId],
        (err) => {
          if (err) return res.status(500).json({ message: 'Error updating user status' });
          res.json({ success: true, message: 'Subscription activated', isSubscription: true });
        }
      );
    } else {
      res.status(400).json({ message: 'Session invalid or not paid' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get billing info
router.get('/billing', verifyToken, (req: any, res) => {
  const userId = req.userId;
  
  db.get('SELECT card_last4, card_exp_month, card_exp_year, card_brand FROM users WHERE id = ?', [userId], (err: any, user: any) => {
    if (err) return res.status(500).json({ message: 'Error fetching card info' });
    
    db.all('SELECT * FROM invoices WHERE user_id = ? ORDER BY date DESC', [userId], (err: any, invoices: any[]) => {
      if (err) return res.status(500).json({ message: 'Error fetching invoices' });
      res.json({
        card: user?.card_last4 ? {
          last4: user.card_last4,
          exp_month: user.card_exp_month,
          exp_year: user.card_exp_year,
          brand: user.card_brand
        } : null,
        invoices: invoices || []
      });
    });
  });
});

// Webhook for Stripe (Placeholder)
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  // Handle webhook events here
  res.json({received: true});
});

export default router;
