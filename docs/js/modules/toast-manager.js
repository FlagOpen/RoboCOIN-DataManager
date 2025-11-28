/**
 * @file Toast Notification Manager Module
 * @description Manages toast notifications for the application
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    /**
     * Initialize the toast container
     */
    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast ('success', 'error', 'info')
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.container) {
            this.init();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-hide after duration
        setTimeout(() => {
            this.hide(toast);
        }, duration);
    }

    /**
     * Hide a toast notification
     * @param {HTMLElement} toast - The toast element to hide
     */
    hide(toast) {
        if (!toast) return;

        toast.classList.remove('show');

        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Show success toast
     * @param {string} message - The message to display
     * @param {number} duration - Duration in milliseconds
     */
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     * @param {string} message - The message to display
     * @param {number} duration - Duration in milliseconds
     */
    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    /**
     * Show info toast
     * @param {string} message - The message to display
     * @param {number} duration - Duration in milliseconds
     */
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
}

// Export singleton instance
const toastManager = new ToastManager();
export default toastManager;
