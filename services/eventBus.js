/**
 * Simple Event Bus for decoupled communication between components.
 */
export class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event.
   * @param {string} event 
   * @param {Function} callback 
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event.
   * @param {string} event 
   * @param {Function} callback 
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event.
   * @param {string} event 
   * @param {any} data 
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

// Singleton instance
export const eventBus = new EventBus();
