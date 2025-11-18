/**
 * Notification Manager - Global notification system for non-React contexts
 * This allows services and utility functions to trigger snackbar notifications
 */

class NotificationManager {
  constructor() {
    this.listeners = [];
  }

  /**
   * Subscribe to notifications
   * @param {Function} callback - Function to call when notification is triggered
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  /**
   * Trigger a notification
   * @param {string} message - Notification message
   * @param {string} severity - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Auto-hide duration in milliseconds
   */
  notify(message, severity = "info", duration = 3000) {
    this.listeners.forEach((listener) => {
      listener({ message, severity, duration });
    });
  }

  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {number} duration - Auto-hide duration
   */
  success(message, duration = 3000) {
    this.notify(message, "success", duration);
  }

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {number} duration - Auto-hide duration
   */
  error(message, duration = 3000) {
    this.notify(message, "error", duration);
  }

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {number} duration - Auto-hide duration
   */
  warning(message, duration = 3000) {
    this.notify(message, "warning", duration);
  }

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {number} duration - Auto-hide duration
   */
  info(message, duration = 3000) {
    this.notify(message, "info", duration);
  }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;
