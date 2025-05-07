/**
 * Custom EventSource implementation with authorization header support
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
    this.intentionalClose = false; // Flag to track intentional closes
    
    // Create initial connection
    this.connect();
  }
  
  connect() {
    this.readyState = 0; // CONNECTING
    this.intentionalClose = false; // Reset the intentional close flag
    
    // Set up headers with auth token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available for EventSource connection');
      this.readyState = 2; // CLOSED
      return;
    }
    
    const fetchController = new AbortController();
    this._controller = fetchController;
    
    try {
      // Create fetch request for SSE
      fetch(this.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        },
        credentials: 'include',
        signal: fetchController.signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        
        this.readyState = 1; // OPEN
        
        // Call onopen handlers
        this._dispatchEvent({
          type: 'open'
        });
        
        const reader = response.body.getReader();
        this._reader = reader; // Store reader reference for cleanup
        let buffer = '';
        
        // Process the stream
        const processStream = ({ done, value }) => {
          // If we're done or the connection was closed intentionally, exit gracefully
          if (done || this.intentionalClose) {
            console.log('EventSource stream closed ' + (this.intentionalClose ? 'intentionally' : 'by server'));
            if (!this.intentionalClose) {
              this._attemptReconnect();
            }
            return;
          }
          
          // Convert bytes to text
          const chunk = new TextDecoder().decode(value);
          buffer += chunk;
          
          // Process complete events in buffer
          const events = buffer.split('\n\n');
          buffer = events.pop() || ''; // Keep the last incomplete event in buffer
          
          events.forEach(event => {
            if (event.trim() === '') return;
            
            const lines = event.split('\n');
            let eventData = {};
            let eventName = 'message';
            
            lines.forEach(line => {
              if (line.startsWith('event:')) {
                eventName = line.substring(6).trim();
              } else if (line.startsWith('data:')) {
                const dataContent = line.substring(5).trim();
                try {
                  eventData = JSON.parse(dataContent);
                } catch (e) {
                  console.warn('Error parsing SSE data JSON:', e);
                  eventData = dataContent;
                }
              }
            });
            
            // Dispatch the event to listeners
            this._dispatchEvent({
              type: eventName,
              data: eventData
            });
          });
          
          // Continue reading
          if (!this.intentionalClose) {
            reader.read().then(processStream).catch(err => {
              // Ignore abort errors if closing was intentional
              if (err.name === 'AbortError' && this.intentionalClose) {
                console.log('Stream reading aborted intentionally');
                return;
              }
              console.error('Error reading SSE stream:', err);
              this._attemptReconnect();
            });
          }
        };
        
        // Start reading
        reader.read().then(processStream).catch(err => {
          // Ignore abort errors if closing was intentional
          if (err.name === 'AbortError' && this.intentionalClose) {
            console.log('Initial stream reading aborted intentionally');
            return;
          }
          console.error('Initial SSE stream read error:', err);
          this._attemptReconnect();
        });
        
        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;
      })
      .catch(error => {
        // Ignore abort errors as they are expected when closing
        if (error.name === 'AbortError' && this.intentionalClose) {
          console.log('EventSource connection aborted intentionally');
          return;
        }
        
        console.error('EventSource fetch error:', error);
        this._dispatchEvent({
          type: 'error',
          error
        });
        
        if (!this.intentionalClose) {
          this._attemptReconnect();
        }
      });
    } catch (error) {
      // Ignore abort errors here as well
      if (error.name === 'AbortError' && this.intentionalClose) {
        console.log('EventSource connection aborted intentionally');
        return;
      }
      
      console.error('EventSource connection error:', error);
      this._dispatchEvent({
        type: 'error',
        error
      });
      
      if (!this.intentionalClose) {
        this._attemptReconnect();
      }
    }
  }
  
  _dispatchEvent(event) {
    // Handle standard event handlers (onmessage, onerror, etc.)
    const handlerName = `on${event.type}`;
    if (typeof this[handlerName] === 'function') {
      try {
        this[handlerName](event);
      } catch (err) {
        console.error(`Error in ${handlerName} handler:`, err);
      }
    }
    
    // Handle custom event listeners
    if (this.listeners.has(event.type)) {
      const listeners = this.listeners.get(event.type);
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in "${event.type}" event listener:`, err);
        }
      });
    }
  }
  
  _attemptReconnect() {
    if (this.readyState === 2 || this.intentionalClose) {
      // Don't reconnect if we're explicitly closed or closing intentionally
      return;
    }
    
    this.reconnectAttempts++;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`Reconnecting EventSource (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached for EventSource.`);
      this.readyState = 2; // CLOSED
      
      this._dispatchEvent({
        type: 'error',
        data: { message: 'Max reconnection attempts reached' }
      });
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
    // Set flags first to prevent reconnection attempts
    this.readyState = 2; // CLOSED
    this.intentionalClose = true;
    
    // Clean up reader if it exists
    if (this._reader) {
      try {
        // Release the reader - this is important to avoid memory leaks
        this._reader.cancel("Connection closed by client").catch(err => {
          console.log("Error canceling reader:", err);
        });
        this._reader = null;
      } catch (e) {
        console.log('Error when canceling reader:', e);
      }
    }
    
    // Abort the fetch controller
    if (this._controller) {
      try {
        this._controller.abort();
      } catch (e) {
        console.log('Error when aborting connection:', e);
      } finally {
        this._controller = null;
      }
    }
    
    console.log('EventSource connection closed by client');
  }
}

export default EventSourceWithAuth;
