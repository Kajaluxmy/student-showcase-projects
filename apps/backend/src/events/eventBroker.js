const EventEmitter = require('events');

class EventBroker extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Extensible for multiple downstream handlers
  }

  // Safe emit method that catches unhandled exceptions in listeners
  emitSafe(event, ...args) {
    try {
      this.emit(event, ...args);
    } catch (error) {
      console.error(`❌ Error caught during emission of event "${event}":`, error.message);
    }
  }
}

// Export a singleton instance
const brokerInstance = new EventBroker();

module.exports = brokerInstance;
