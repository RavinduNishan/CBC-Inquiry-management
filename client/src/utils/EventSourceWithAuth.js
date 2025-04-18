/**
 * EventSource polyfill that supports custom headers for authentication
 */
class EventSourceWithAuth {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.listeners = new Map();
    this.readyState = 0; // 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
    
    // Create initial connection
    this.connect();
  }
  
  connect() {
    this.readyState = 0; // CONNECTING
    
    // Set up headers with auth token
    const token = localStorage.getItem('token');
    const headers = new Headers({
      'Authorization': `Bearer ${token}`
    });
    
    // Create fetch request for SSE
    fetch(this.url, {
      method: 'GET',
      headers,
      credentials: 'include'
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      
      this.readyState = 1; // OPEN
      
      // Call onopen handlers
      this._dispatchEvent({
        type: 'open'
      });
      
      const reader = response.body.getReader();
      let buffer = '';
      
      const processStream = ({ done, value }) => {
        if (done) {
          this.reconnect();
          return;
        }
        
        // Convert bytes to text
        const chunk = new TextDecoder().decode(value);
        buffer += chunk;
        
        // Process complete events in buffer
        const lines = buffer.split('\n');
        let eventData = {};
        let eventName = 'message';
        
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.trim() === '') {
            // Empty line means end of event
            if (Object.keys(eventData).length) {
              this._dispatchEvent({
                type: eventName,
                data: eventData.data,
                id: eventData.id
              });
              eventData = {};
              eventName = 'message';
            }
          } else if (line.startsWith('event:')) {
            eventName = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const data = line.substring(5).trim();
            try {
              eventData.data = JSON.parse(data);
            } catch (e) {
              eventData.data = data;
            }
          } else if (line.startsWith('id:')) {
            eventData.id = line.substring(3).trim();
          }
        }
        
        // Save incomplete event data
        buffer = lines[lines.length - 1];
        
        // Continue reading
        return reader.read().then(processStream);
      };
      
      // Start reading
      reader.read().then(processStream);
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    }).catch(error => {
      console.error('EventSource error:', error);
      this._dispatchEvent({
        type: 'error',
        error
      });
      this.reconnect();
    });
  }
  
  _dispatchEvent(event) {
    if (this.listeners.has(event.type)) {
      this.listeners.get(event.type).forEach(listener => {
        listener(event);
      });
    }
    
    // Also handle onX properties
    const handlerName = `on${event.type}`;
    if (typeof this[handlerName] === 'function') {
      this[handlerName](event);
    }
  }
  
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(listener);
  }
  
  removeEventListener(type, listener) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(listener);
      if (this.listeners.get(type).size === 0) {
        this.listeners.delete(type);
      }
    }
  }
  
  close() {
    this.readyState = 2; // CLOSED
    if (this._controller) {
      this._controller.abort();
    }
  }
  
  reconnect() {
    if (this.readyState === 2) {
      // Don't reconnect if we're explicitly closed
      return;
    }
    
    this.reconnectAttempts++;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Reconnecting EventSource (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectInterval);
    }
  }
}

export default EventSourceWithAuth;
