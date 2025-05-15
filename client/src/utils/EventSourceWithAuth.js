class EventSourceWithAuth {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.eventSource = null;
    this.listeners = {};
    this.reconnectAttempt = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 5000; // Increased from 3000
    this.isConnected = false;
    this.forceDisconnected = false;
    this.timeoutId = null;
    this.controller = null;
    this.debug = options.debug || true;
    this.timeoutDuration = options.timeoutDuration || 30000; // Increased from 15000
    this.connectionLostRetries = 0;
    this.maxConnectionLostRetries = 3;
    this.userId = null; // Track which user this connection belongs to
    this.init();

    // Set connected flag when connection opens
    this.addEventListener('open', () => {
      this.isConnected = true;
    });
    
    // Reset connected flag when connection closes
    this.addEventListener('error', () => {
      this.isConnected = false;
    });
  }

  init() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No auth token available for SSE connection');
      this.triggerError(new Error('Authentication required'));
      return;
    }
    
    try {
      // Clean up any existing resources
      this._cleanup();
      
      // Create new EventSource with headers
      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      const fetchOptions = {
        headers,
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
      };
      
      // Don't use AbortController to avoid abort errors
      let isFetchTimedOut = false;
      
      // Log the connection attempt with more details
      if (this.debug) {
        console.log(`Attempting SSE connection to ${this.url} with timeout: ${this.timeoutDuration}ms`);
      }
      
      // Set timeout to track connection timeouts
      this.timeoutId = setTimeout(() => {
        console.log(`SSE connection timeout - connection is taking too long (${this.timeoutDuration}ms)`);
        isFetchTimedOut = true;
        this.reconnect();
      }, this.timeoutDuration);
      
      // Use fetch to establish the SSE connection with proper credentials
      fetch(this.url, fetchOptions)
        .then(response => {
          // Clear timeout since connection was successful
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
          }
          
          // Don't proceed if we already timed out
          if (isFetchTimedOut) return;
          
          if (!response.ok) {
            throw new Error(`SSE connection failed with status: ${response.status}`);
          }
          
          if (this.debug) {
            console.log('SSE connection established successfully');
          }
          
          // Reset reconnection count on successful connection
          this.reconnectAttempt = 0;
          this.connectionLostRetries = 0;
          this.isConnected = true;
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          
          const processStreamData = ({ value, done }) => {
            if (done) {
              console.log('SSE stream closed by server');
              this.isConnected = false;
              this.reconnect();
              return;
            }
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  this.isConnected = true;
                  this.reconnectAttempt = 0;
                  this.dispatchEvent('message', { data: JSON.stringify(data) });
                  
                  if (data.type) {
                    this.dispatchEvent(data.type, { data: JSON.stringify(data) });
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, line);
                }
              }
            });
            
            reader.read().then(processStreamData).catch(error => {
              console.log('Error reading SSE stream:', error);
              this.isConnected = false;
              this.reconnect();
            });
          };
          
          reader.read().then(processStreamData).catch(error => {
            console.log('Error reading SSE stream:', error);
            this.isConnected = false;
            this.reconnect();
          });
        })
        .catch(error => {
          // Clear timeout if it's still active
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
          }
          
          // Don't proceed if we already timed out
          if (isFetchTimedOut) return;
          
          console.error('SSE fetch error:', error);
          this.isConnected = false;
          
          if (!this.forceDisconnected) {
            this.reconnect();
          }
        });
    } catch (error) {
      // Clear timeout if it's still active
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      
      console.error('Error setting up SSE connection:', error);
      if (!this.forceDisconnected) {
        this.reconnect();
      }
    }
  }
  
  _cleanup() {
    // Same safe cleanup approach
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // Nullify controller without abort
    this.controller = null;
    
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {
        // Silent cleanup
      } finally {
        this.eventSource = null;
      }
    }
  }

  reconnect() {
    if (this.forceDisconnected || this.reconnectAttempt >= this.maxReconnectAttempts) {
      return;
    }
    
    this.reconnectAttempt += 1;
    console.log(`Reconnecting EventSource (attempt ${this.reconnectAttempt}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (!this.forceDisconnected) {
        this.init();
      }
    }, this.reconnectInterval);
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
    return this;
  }

  removeEventListener(type, callback) {
    if (!this.listeners[type]) return this;
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    return this;
  }

  dispatchEvent(type, event) {
    if (!this.listeners[type]) return;
    this.listeners[type].forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in ${type} event handler:`, error);
      }
    });
  }
  
  triggerError(error) {
    this.dispatchEvent('error', { data: JSON.stringify({ type: 'error', message: error.message }) });
  }

  close() {
    // Clean up ping interval
    this.stopKeepAlive();
    
    // Set flag first to prevent reconnection attempts
    this.forceDisconnected = true;
    
    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    // Close event source if exists
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {
        // Silently ignore errors during close
      } finally {
        this.eventSource = null;
      }
    }
    
    // Clear controller without trying to abort it
    this.controller = null;
    
    // Clear listeners
    this.listeners = {};

    this.isConnected = false;
  }

  // Add a ping method to help keep the connection alive
  startKeepAlive() {
    // Clear any existing ping interval
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
    }
    
    // Create a new ping interval
    this.pingIntervalId = setInterval(() => {
      if (this.isConnected) {
        if (this.debug) {
          console.log('Sending keep-alive ping to SSE connection');
        }
        // Dispatch a custom ping event to keep the connection active
        this.dispatchEvent('ping', { data: JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }) });
      }
    }, 45000); // Send a ping every 45 seconds
  }

  // Clean up ping interval
  stopKeepAlive() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }
}

export default EventSourceWithAuth;
