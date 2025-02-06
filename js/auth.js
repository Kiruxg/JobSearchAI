class AuthService {
    constructor() {
        // OAuth configuration
        this.config = {
            linkedin: {
                clientId: 'YOUR_LINKEDIN_CLIENT_ID',
                redirectUri: `${window.location.origin}/auth/linkedin/callback`,
                scope: 'r_emailaddress r_liteprofile w_member_social',
                authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
            },
            indeed: {
                clientId: 'YOUR_INDEED_CLIENT_ID',
                redirectUri: `${window.location.origin}/auth/indeed/callback`,
                scope: 'email applications',
                authUrl: 'https://secure.indeed.com/oauth/v2/authorize'
            }
        };

        // Initialize auth state
        this.tokens = {
            linkedin: null,
            indeed: null
        };

        this.initializeAuth();
    }

    initializeAuth() {
        // Listen for auth callbacks
        window.addEventListener('message', this.handleAuthMessage.bind(this));
        
        // Check for existing tokens
        this.checkExistingTokens();
    }

    async checkExistingTokens() {
        try {
            const response = await fetch('/api/auth/status');
            const status = await response.json();
            
            this.tokens.linkedin = status.linkedin || null;
            this.tokens.indeed = status.indeed || null;

            // Update UI if needed
            this.updateConnectionStatus();
        } catch (error) {
            console.error('Failed to check auth status:', error);
        }
    }

    updateConnectionStatus() {
        // Update LinkedIn status
        const linkedinStatus = document.getElementById('linkedinStatus');
        if (linkedinStatus) {
            if (this.tokens.linkedin) {
                linkedinStatus.textContent = 'Connected';
                linkedinStatus.classList.add('connected');
            } else {
                linkedinStatus.textContent = 'Not connected';
                linkedinStatus.classList.remove('connected');
            }
        }

        // Update Indeed status
        const indeedStatus = document.getElementById('indeedStatus');
        if (indeedStatus) {
            if (this.tokens.indeed) {
                indeedStatus.textContent = 'Connected';
                indeedStatus.classList.add('connected');
            } else {
                indeedStatus.textContent = 'Not connected';
                indeedStatus.classList.remove('connected');
            }
        }
    }

    async initiateAuth(platform) {
        const config = this.config[platform];
        if (!config) throw new Error('Invalid platform');

        // Generate and store state for CSRF protection
        const state = this.generateState();
        localStorage.setItem(`${platform}_auth_state`, state);

        // Build auth URL
        const authUrl = `${config.authUrl}?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scope)}&` +
            `state=${state}&` +
            `response_type=code`;

        // Open popup for auth
        const popup = window.open(
            authUrl,
            `${platform} Login`,
            'width=600,height=600,left=400,top=100'
        );

        // Handle popup blocker
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            throw new Error('Popup blocked! Please allow popups for this site.');
        }

        return new Promise((resolve, reject) => {
            this.authPromise = { resolve, reject };

            // Handle popup close
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    reject(new Error('Authentication cancelled'));
                }
            }, 1000);
        });
    }

    async handleAuthMessage(event) {
        // Verify origin
        if (event.origin !== window.location.origin) return;

        const { platform, code, state, error } = event.data;

        if (error) {
            this.authPromise?.reject(new Error(error));
            return;
        }

        // Verify state
        const savedState = localStorage.getItem(`${platform}_auth_state`);
        if (state !== savedState) {
            this.authPromise?.reject(new Error('Invalid state'));
            return;
        }

        try {
            // Exchange code for token
            const token = await this.exchangeCodeForToken(platform, code);
            this.tokens[platform] = token;
            this.updateConnectionStatus();
            this.authPromise?.resolve(token);
        } catch (error) {
            this.authPromise?.reject(error);
        } finally {
            localStorage.removeItem(`${platform}_auth_state`);
        }
    }

    async exchangeCodeForToken(platform, code) {
        const response = await fetch(`/api/auth/${platform}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        return response.json();
    }

    generateState() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async disconnect(platform) {
        try {
            await fetch(`/api/auth/${platform}/disconnect`, {
                method: 'POST'
            });
            
            this.tokens[platform] = null;
            this.updateConnectionStatus();
            
            return true;
        } catch (error) {
            console.error(`Failed to disconnect ${platform}:`, error);
            throw error;
        }
    }

    isConnected(platform) {
        return !!this.tokens[platform];
    }

    async refreshToken(platform) {
        try {
            const response = await fetch(`/api/auth/${platform}/refresh`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }
            
            const token = await response.json();
            this.tokens[platform] = token;
            
            return token;
        } catch (error) {
            console.error(`Failed to refresh ${platform} token:`, error);
            throw error;
        }
    }
}

// Export the service
export const authService = new AuthService(); 