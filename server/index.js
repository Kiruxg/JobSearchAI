const express = require('express');
const cors = require('cors');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const passport = require('passport');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // Only initialize, no session

// LinkedIn token exchange endpoint
app.post('/api/auth/linkedin/token', async (req, res) => {
    try {
        const { code } = req.body;

        // Exchange authorization code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET
        });

        // Get user's LinkedIn profile
        const userProfile = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`
            }
        });

        // Get user's job applications
        const applications = await axios.get('https://api.linkedin.com/v2/jobApplications', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`
            }
        });

        res.json({
            access_token: tokenResponse.data.access_token,
            expires_in: tokenResponse.data.expires_in,
            profile: userProfile.data,
            applications: applications.data
        });

    } catch (error) {
        console.error('LinkedIn token exchange error:', error);
        res.status(500).json({ error: 'Failed to exchange LinkedIn token' });
    }
});

// Indeed token exchange endpoint
app.post('/api/auth/indeed/token', async (req, res) => {
    try {
        const { code } = req.body;

        // Exchange authorization code for access token
        const tokenResponse = await axios.post('https://apis.indeed.com/oauth/v2/tokens', {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.INDEED_REDIRECT_URI,
            client_id: process.env.INDEED_CLIENT_ID,
            client_secret: process.env.INDEED_CLIENT_SECRET
        });

        // Get user's Indeed profile
        const userProfile = await axios.get('https://apis.indeed.com/oauth/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`
            }
        });

        // Get user's job applications
        const applications = await axios.get('https://apis.indeed.com/v2/jobapplications', {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`
            }
        });

        res.json({
            access_token: tokenResponse.data.access_token,
            expires_in: tokenResponse.data.expires_in,
            profile: userProfile.data,
            applications: applications.data
        });

    } catch (error) {
        console.error('Indeed token exchange error:', error);
        res.status(500).json({ error: 'Failed to exchange Indeed token' });
    }
});

// Subscription endpoints
app.post('/api/subscription/create-checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.STRIPE_PREMIUM_PRICE_ID,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
            metadata: {
                userId: req.body.userId // You'll need to pass this from the frontend
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Checkout creation failed:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Get subscription status
app.get('/api/subscription/status', async (req, res) => {
    try {
        // You'll need to implement user authentication and get the userId
        const userId = req.query.userId;
        
        const subscription = await stripe.subscriptions.list({
            customer: userId,
            status: 'active',
            limit: 1
        });

        res.json({
            plan: subscription.data.length > 0 ? 'premium' : 'free',
            subscriptionId: subscription.data[0]?.id,
            endDate: subscription.data[0]?.current_period_end
        });
    } catch (error) {
        console.error('Failed to get subscription status:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
});

// Cancel subscription
app.post('/api/subscription/cancel', async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });

        res.json({ message: 'Subscription will be cancelled at the end of the billing period' });
    } catch (error) {
        console.error('Failed to cancel subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Stripe webhook handler
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different webhook events
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            // Update user's subscription status in your database
            await handleSubscriptionChange(subscription);
            break;
            
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
            const invoice = event.data.object;
            // Handle payment success/failure
            await handlePaymentStatus(invoice);
            break;
    }

    res.json({ received: true });
});

// Use routes
app.use(authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Helper functions for webhook handlers
async function handleSubscriptionChange(subscription) {
    // Implement subscription status updates in your database
    console.log('Subscription changed:', subscription.id, subscription.status);
}

async function handlePaymentStatus(invoice) {
    // Implement payment status handling
    console.log('Payment status:', invoice.id, invoice.status);
} 