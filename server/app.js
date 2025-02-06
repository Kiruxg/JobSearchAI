const express = require('express');
const axios = require('axios');
const app = express();

app.post('/api/linkedin/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        // Exchange code for access token
        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI
        });

        // Store token securely
        // Set up webhook for updates
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); 