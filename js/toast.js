// Centralized Toast System
class ToastNotification {
    constructor() {
        if (ToastNotification.instance) {
            return ToastNotification.instance;
        }
        ToastNotification.instance = this;
        this.createToastContainer();
    }

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        // Force a reflow to ensure animation plays
        toast.offsetHeight;

        // Show toast
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss
        setTimeout(() => this.dismiss(toast), duration);
    }

    dismiss(toast) {
        toast.classList.add('hiding');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }
}

// Make toast globally available
window.toast = new ToastNotification();

toast.show('Changes saved!', 'success');
toast.show('Something went wrong', 'error');
toast.show('Loading...', 'info'); 