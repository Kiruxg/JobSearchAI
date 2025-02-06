class UserAuthService {
    constructor() {
        this.baseUrl = '/api/auth';
        this.user = null;
        this.checkAuthStatus();
        this.setupSocialLoginHandlers();
    }

    async signup(email, password, name) {
        try {
            const response = await fetch(`${this.baseUrl}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            this.setUser(data.user);
            return data;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            this.setUser(data.user);
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await fetch(`${this.baseUrl}/logout`, {
                method: 'POST'
            });
            this.clearUser();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/status`);
            if (response.ok) {
                const data = await response.json();
                this.setUser(data.user);
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Auth status check failed:', error);
            return null;
        }
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.updateUI();
    }

    clearUser() {
        this.user = null;
        localStorage.removeItem('user');
        this.updateUI();
    }

    updateUI() {
        const authButtons = document.querySelectorAll('[data-auth-display]');
        authButtons.forEach(button => {
            const showWhen = button.dataset.authDisplay;
            button.style.display = 
                (showWhen === 'logged-in' && this.user) || 
                (showWhen === 'logged-out' && !this.user) 
                    ? 'block' 
                    : 'none';
        });
    }

    isAuthenticated() {
        return !!this.user;
    }

    setupSocialLoginHandlers() {
        // Setup Google login
        document.querySelectorAll('.social-button.google').forEach(button => {
            button.addEventListener('click', () => this.handleGoogleLogin());
        });

        // Setup LinkedIn login
        document.querySelectorAll('.social-button.linkedin').forEach(button => {
            button.addEventListener('click', () => this.handleLinkedInLogin());
        });
    }

    handleGoogleLogin() {
        // Store current page URL for redirect after login
        localStorage.setItem('authRedirect', window.location.href);
        
        // Open Google OAuth in popup
        const width = 500;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        window.open(
            `${this.baseUrl}/google`,
            'Google Login',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    }

    handleLinkedInLogin() {
        localStorage.setItem('authRedirect', window.location.href);
        
        const width = 500;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        window.open(
            `${this.baseUrl}/linkedin`,
            'LinkedIn Login',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    }

    // Handle OAuth callback messages
    setupOAuthCallback() {
        window.addEventListener('message', (event) => {
            // Verify origin
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'oauth-success') {
                this.setUser(event.data.user);
                const redirect = localStorage.getItem('authRedirect') || '/dashboard.html';
                localStorage.removeItem('authRedirect');
                window.location.href = redirect;
            } else if (event.data.type === 'oauth-error') {
                this.showError(event.data.error);
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize auth service
const userAuth = new UserAuthService();
window.userAuth = userAuth;

// Protect pages that require authentication
if (document.body.dataset.requireAuth && !userAuth.isAuthenticated()) {
    window.location.href = '/login.html';
} 