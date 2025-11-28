/**
 * @file Toast Notification Manager Module
 * @description Manages toast notifications for the application
 */

class ToastManager {
    constructor() {
        this.toastElement = null;
        this.currentTimer = null;
        this.init();
    }

    /**
     * Initialize the toast element
     */
    init() {
        // Create toast element if it doesn't exist
        if (!this.toastElement) {
            this.toastElement = document.createElement('div');
            this.toastElement.className = 'toast-notification';
            this.toastElement.style.display = 'none';
            document.body.appendChild(this.toastElement);
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast ('success', 'error', 'info')
     * @param {number} duration - Duration in milliseconds (default: 2000)
     */
    show(message, type = 'info', duration = 2000) {
        if (!this.toastElement) {
            this.init();
        }

        // Clear any existing timer
        if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }

        // Update toast content and type
        this.toastElement.textContent = message;
        this.toastElement.className = `toast-notification ${type}`;

        // Show the toast
        this.toastElement.style.display = 'flex';

        // Trigger animation
        requestAnimationFrame(() => {
            this.toastElement.classList.add('show');
        });

        // Auto-hide after duration
        this.currentTimer = setTimeout(() => {
            this.hide();
        }, duration);
    }

    /**
     * Hide the toast notification
     */
    hide() {
        if (!this.toastElement) return;

        // Clear timer if exists
        if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }

        this.toastElement.classList.remove('show');

        // Hide after animation
        setTimeout(() => {
            if (this.toastElement) {
                this.toastElement.style.display = 'none';
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
