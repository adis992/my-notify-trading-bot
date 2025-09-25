import axios from 'axios';

// Get API URLs from localStorage or use defaults
const getApiUrls = () => {
  const customApiUrl = localStorage.getItem('trading_api_url');
  
  // Default backend URLs - Use improved Render backend with caching
  const PRODUCTION_API_URL = "https://my-notify-trading-bot.onrender.com";
  const LOCAL_API_URL = "http://localhost:4000";
  
  // If custom API is set and it's our backend, use it
  if (customApiUrl && customApiUrl.includes('my-notify-trading-bot')) {
    return customApiUrl;
  }
  
  // Otherwise use production/local logic
  return window.location.hostname.includes('github.io') 
    ? PRODUCTION_API_URL 
    : LOCAL_API_URL;
};

// Configure axios with longer timeout for Render cold starts
const createApiClient = () => {
  const apiKey = localStorage.getItem('trading_api_key') || '';
  
  return axios.create({
    timeout: 60000, // 60 seconds timeout for Render cold starts
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    }
  });
};

// Retry function for failed requests
const retryRequest = async (requestFn, maxRetries = 3, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      
      // Wait before retrying, longer delay for cold starts
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Wake up Render backend to avoid cold start delays
const wakeUpBackend = async (apiUrl) => {
    try {
        console.log(`🔥 Waking up backend at: ${apiUrl}/test`);
        const apiClient = createApiClient();
        await apiClient.get(`${apiUrl}/test`);
        console.log(`✅ Backend is awake and ready!`);
    } catch (error) {
        console.warn(`⚠️ Backend wake up failed, continuing anyway...`, error.message);
    }
};

export const fetchMarketData = async (coin) => {
    return retryRequest(async () => {
        const API_BASE_URL = getApiUrls();
        
        // Wake up backend first if it's Render
        if (API_BASE_URL.includes('onrender.com')) {
            await wakeUpBackend(API_BASE_URL);
        }
        
        const apiClient = createApiClient();
        console.log(`🚀 Fetching real-time data from: ${API_BASE_URL}/api/getAllIndicators?coin=${coin}`);
        
        try {
            const response = await apiClient.get(`${API_BASE_URL}/api/getAllIndicators?coin=${coin}`);
            console.log(`✅ API Response received:`, response.status, response.data?.success);
            return response.data.success ? response.data.data : [];
        } catch (error) {
            console.error(`❌ API Error:`, error.response?.status, error.response?.data, error.message);
            throw error;
        }
    });
};

export const fetchLogs = async () => {
    return retryRequest(async () => {
        const API_BASE_URL = getApiUrls();
        const apiClient = createApiClient();
        const response = await apiClient.get(`${API_BASE_URL}/api/logs`);
        return response.data.success ? response.data.logs : [];
    });
};

export const fetchTradeHistory = async () => {
    return retryRequest(async () => {
        const API_BASE_URL = getApiUrls();
        const apiClient = createApiClient();
        const response = await apiClient.get(`${API_BASE_URL}/api/tradeHistory`);
        return response.data.success ? response.data.trades : [];
    });
};
