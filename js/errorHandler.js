class ErrorHandler {
    constructor() {
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });

        // Handle general errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });
    }

    handleError(error, context = '') {
        // Log error
        this.logError(error, context);

        // Show user-friendly message
        this.showErrorToUser(error);

        // Report error to monitoring service if needed
        this.reportError(error, context);
    }

    showErrorToUser(error) {
        let message = 'An error occurred';

        // Handle known error types
        switch (error.code) {
            case 'AUTH_FAILED':
                message = 'Authentication failed. Please log in again.';
                userAuth.logout();
                break;
            case 'SUBSCRIPTION_REQUIRED':
                message = 'This feature requires a premium subscription';
                subscriptionManager.showUpgradeModal();
                break;
            case 'NETWORK_ERROR':
                message = 'Network error. Please check your connection.';
                break;
            case 'API_ERROR':
                message = 'Service temporarily unavailable. Please try again later.';
                break;
            case 'VALIDATION_ERROR':
                message = error.message || 'Please check your input.';
                break;
            default:
                if (error.message && !error.message.includes('internal')) {
                    message = error.message;
                }
        }

        // Show toast notification
        this.showToast(message, 'error');
    }

    showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">
                    ${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;

        document.body.appendChild(toast);

        // Add close button functionality
        toast.querySelector('.toast-close').onclick = () => toast.remove();

        // Auto remove after 5 seconds
        setTimeout(() => toast.remove(), 5000);
    }

    logError(error, context) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            context,
            user: userAuth.user?.id,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error('Error Log:', errorLog);

        // Store in local storage for debugging
        this.storeErrorLog(errorLog);
    }

    storeErrorLog(errorLog) {
        try {
            const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            logs.push(errorLog);
            // Keep only last 10 errors
            if (logs.length > 10) logs.shift();
            localStorage.setItem('error_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to store error log:', e);
        }
    }

    reportError(error, context) {
        // Implement error reporting to your backend
        fetch('/api/error-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: {
                    message: error.message,
                    stack: error.stack,
                    code: error.code
                },
                context,
                user: userAuth.user?.id,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.error('Failed to report error:', e));
    }

    // Custom error classes
    static AuthError(message) {
        const error = new Error(message);
        error.code = 'AUTH_FAILED';
        return error;
    }

    static SubscriptionError(message) {
        const error = new Error(message);
        error.code = 'SUBSCRIPTION_REQUIRED';
        return error;
    }

    static NetworkError(message) {
        const error = new Error(message);
        error.code = 'NETWORK_ERROR';
        return error;
    }

    static ValidationError(message) {
        const error = new Error(message);
        error.code = 'VALIDATION_ERROR';
        return error;
    }

    static ApiError(message) {
        const error = new Error(message);
        error.code = 'API_ERROR';
        return error;
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;

// Usage example in other files:
try {
    // Some code that might fail
} catch (error) {
    errorHandler.handleError(error, 'Context of where error occurred');
} 