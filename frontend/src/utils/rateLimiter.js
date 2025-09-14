// Rate limiting utility for API calls
class RateLimiter {
  constructor(maxCalls = 100, timeWindow = 60000) { // 100 calls per minute default
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.calls = [];
  }

  canMakeCall() {
    const now = Date.now();
    
    // Remove old calls outside the time window
    this.calls = this.calls.filter(callTime => now - callTime < this.timeWindow);
    
    return this.calls.length < this.maxCalls;
  }

  recordCall() {
    this.calls.push(Date.now());
  }

  getWaitTime() {
    if (this.calls.length === 0) return 0;
    
    const oldestCall = Math.min(...this.calls);
    const timeUntilReset = this.timeWindow - (Date.now() - oldestCall);
    
    return Math.max(0, timeUntilReset);
  }

  getRemainingCalls() {
    const now = Date.now();
    this.calls = this.calls.filter(callTime => now - callTime < this.timeWindow);
    return Math.max(0, this.maxCalls - this.calls.length);
  }
}

// Create rate limiter based on API provider
export const createRateLimiter = (apiUrl) => {
  if (apiUrl.includes('coingecko.com') && !apiUrl.includes('pro-api')) {
    return new RateLimiter(100, 60000); // Free CoinGecko: 100/minute
  } else if (apiUrl.includes('pro-api.coingecko.com')) {
    return new RateLimiter(500, 60000); // Pro CoinGecko: 500/minute
  } else {
    return new RateLimiter(1000, 60000); // Custom APIs: 1000/minute default
  }
};

// Global rate limiter instance
let globalRateLimiter = createRateLimiter(localStorage.getItem('trading_api_url') || 'https://api.coingecko.com/api/v3');

// Update rate limiter when API changes
export const updateRateLimiter = (apiUrl) => {
  globalRateLimiter = createRateLimiter(apiUrl);
};

// API call wrapper with rate limiting
export const makeApiCall = async (apiCall, errorCallback = null) => {
  try {
    // Check rate limit
    if (!globalRateLimiter.canMakeCall()) {
      const waitTime = globalRateLimiter.getWaitTime();
      const message = `Rate limit exceeded. Wait ${Math.ceil(waitTime/1000)} seconds. Remaining calls: ${globalRateLimiter.getRemainingCalls()}`;
      
      if (errorCallback) errorCallback(message);
      throw new Error(message);
    }

    // Record the call
    globalRateLimiter.recordCall();
    
    // Make the API call
    const result = await apiCall();
    return result;
    
  } catch (error) {
    // Handle specific API errors
    if (error.response) {
      const status = error.response.status;
      let message = `API Error ${status}: `;
      
      switch (status) {
        case 429:
          message += 'Rate limit exceeded. Please wait before making more requests.';
          break;
        case 401:
          message += 'Unauthorized. Check your API key.';
          break;
        case 403:
          message += 'Forbidden. API access denied.';
          break;
        case 451:
          message += 'API blocked in your region. Try using a VPN.';
          break;
        case 500:
          message += 'Server error. Try again later.';
          break;
        default:
          message += error.response.statusText || 'Unknown error';
      }
      
      if (errorCallback) errorCallback(message);
      throw new Error(message);
    }
    
    if (errorCallback) errorCallback(error.message);
    throw error;
  }
};

// Get rate limiter status
export const getRateLimiterStatus = () => {
  return {
    remainingCalls: globalRateLimiter.getRemainingCalls(),
    maxCalls: globalRateLimiter.maxCalls,
    waitTime: globalRateLimiter.getWaitTime(),
    timeWindow: globalRateLimiter.timeWindow
  };
};
