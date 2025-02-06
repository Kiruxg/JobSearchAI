class SubscriptionManager {
    constructor() {
        this.plans = {
            free: {
                name: 'Free',
                price: 0,
                features: [
                    'Manual job tracking',
                    'Basic dashboard',
                    'Limited to 25 applications',
                    'Basic status updates'
                ],
                description: 'Perfect for getting started with your job search'
            },
            premium: {
                name: 'Premium',
                price: 15,
                interval: 'month',
                features: [
                    'Automatic job board integration',
                    'Advanced analytics',
                    'Unlimited applications',
                    'Email notifications',
                    'Export data',
                    'Priority support',
                    'LinkedIn/Indeed Auto-sync'
                ],
                description: 'For serious job seekers who want to streamline their search'
            }
        };

        const stripe = Stripe('pk_test_51HQ5UXAOBzJpPKFIV5gh2vq1C6VJeVnXsCisgeiIp9WTZHarHSxiw5c78cvPGnHOKnIUTDQasR584uty4oEiNDhq00KkCHtBgH');
        this.currentPlan = 'free';
        this.isAuthenticated = false;
        this.checkAuthentication();
        this.initializeSubscription();
        this.setupEventListeners();
    }

    async checkAuthentication() {
        try {
            const response = await fetch('/api/auth/status');
            const { isAuthenticated } = await response.json();
            this.isAuthenticated = isAuthenticated;
            
            if (!this.isAuthenticated) {
                this.redirectToLogin();
                return false;
            }
            return true;
        } catch (error) {
            console.error('Failed to check authentication status:', error);
            return false;
        }
    }

    redirectToLogin() {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
    }

    async initializeSubscription() {
        if (!await this.checkAuthentication()) return;
        
        try {
            const response = await fetch('/api/subscription/status');
            const status = await response.json();
            this.currentPlan = status.plan;
            this.updateUI();
            this.checkFeatureAccess();
        } catch (error) {
            console.error('Failed to get subscription status:', error);
            this.showToast('Failed to load subscription status', 'error');
        }
    }

    setupEventListeners() {
        // Listen for upgrade button clicks
        document.querySelectorAll('.upgrade-btn').forEach(button => {
            button.addEventListener('click', () => this.showUpgradeModal());
        });

        // Listen for premium feature clicks
        document.querySelectorAll('[data-premium-feature]').forEach(element => {
            element.addEventListener('click', (e) => {
                if (this.currentPlan !== 'premium') {
                    e.preventDefault();
                    this.showUpgradePrompt(element.dataset.premiumFeature);
                }
            });
        });
    }

    async showUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Choose Your Plan</h2>
                <div class="plans-comparison">
                    <div class="plan free ${this.currentPlan === 'free' ? 'current' : ''}">
                        <div class="plan-header">
                            <h3>${this.plans.free.name}</h3>
                            <div class="price">$${this.plans.free.price}</div>
                            <p class="description">${this.plans.free.description}</p>
                        </div>
                        <ul class="features">
                            ${this.plans.free.features.map(feature => 
                                `<li><span class="check">✓</span> ${feature}</li>`
                            ).join('')}
                        </ul>
                        <button class="plan-button" 
                                ${this.currentPlan === 'free' ? 'disabled' : ''}
                                onclick="subscriptionManager.selectPlan('free')">
                            ${this.currentPlan === 'free' ? 'Current Plan' : 'Select Free'}
                        </button>
                    </div>
                    <div class="plan premium ${this.currentPlan === 'premium' ? 'current' : ''}">
                        <div class="plan-header">
                            <h3>${this.plans.premium.name}</h3>
                            <div class="price">
                                $${this.plans.premium.price}
                                <span class="interval">/${this.plans.premium.interval}</span>
                            </div>
                            <p class="description">${this.plans.premium.description}</p>
                        </div>
                        <ul class="features">
                            ${this.plans.premium.features.map(feature => 
                                `<li><span class="check">✓</span> ${feature}</li>`
                            ).join('')}
                        </ul>
                        <button class="plan-button premium-button" 
                                ${this.currentPlan === 'premium' ? 'disabled' : ''}
                                onclick="subscriptionManager.selectPlan('premium')">
                            ${this.currentPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    async selectPlan(plan) {
        if (!await this.checkAuthentication()) return;
        
        if (plan === this.currentPlan) return;

        if (plan === 'premium') {
            await this.handleUpgrade();
        } else {
            await this.handleDowngrade();
        }
    }

    async handleUpgrade() {
        if (!await this.checkAuthentication()) return;
        
        try {
            const response = await fetch('/api/subscription/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const session = await response.json();

            const result = await this.stripe.redirectToCheckout({
                sessionId: session.sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            window.toast.show('Subscription upgraded successfully!', 'success');
        } catch (error) {
            console.error('Upgrade failed:', error);
            window.toast.show('Failed to upgrade subscription', 'error');
        }
    }

    async handleDowngrade() {
        if (!await this.checkAuthentication()) return;
        
        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST'
            });

            const result = await response.json();
            this.showToast('Subscription will be cancelled at the end of the billing period', 'info');
            this.updateUI();
        } catch (error) {
            console.error('Downgrade failed:', error);
            this.showToast('Failed to cancel subscription. Please try again.', 'error');
        }
    }

    showUpgradePrompt(feature) {
        const prompt = document.createElement('div');
        prompt.className = 'upgrade-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <h3>Premium Feature</h3>
                <p>${feature} is available with our Premium plan.</p>
                <div class="prompt-actions">
                    <button class="premium-button" onclick="subscriptionManager.showUpgradeModal()">
                        Upgrade Now
                    </button>
                    <button class="secondary-button" onclick="this.closest('.upgrade-prompt').remove()">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(prompt);
    }

    updateUI() {
        document.body.classList.toggle('premium-active', this.currentPlan === 'premium');
        
        // Update premium features visibility
        document.querySelectorAll('[data-premium-feature]').forEach(element => {
            element.classList.toggle('premium-locked', this.currentPlan !== 'premium');
        });

        // Update subscription buttons
        document.querySelectorAll('.subscription-status').forEach(element => {
            element.textContent = `Current Plan: ${this.plans[this.currentPlan].name}`;
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    checkFeatureAccess(feature) {
        if (this.currentPlan === 'free' && this.plans.premium.features.includes(feature)) {
            this.showUpgradePrompt(feature);
            return false;
        }
        return true;
    }
}

// Initialize subscription manager
const subscriptionManager = new SubscriptionManager();
window.subscriptionManager = subscriptionManager; // Make it globally accessible 