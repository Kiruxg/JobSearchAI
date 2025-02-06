const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('../auth/strategies');

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Google OAuth Routes
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        const userData = encodeURIComponent(JSON.stringify(req.user));
        res.redirect(`/oauth-callback.html?user=${userData}`);
    }
);

// LinkedIn OAuth Routes
router.get('/auth/linkedin',
    passport.authenticate('linkedin', { state: true })
);

router.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        const userData = encodeURIComponent(JSON.stringify(req.user));
        res.redirect(`/oauth-callback.html?user=${userData}`);
    }
);

// Local Auth Routes
router.post('/auth/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Add user creation logic here
        const user = await prisma.user.create({
            data: {
                email,
                password,
                firstName,
                lastName
            }
        });
        
        const token = generateToken(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Auth status
router.get('/auth/status', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router; 