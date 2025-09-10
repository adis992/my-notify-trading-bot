import axios from 'axios';

// Production backend URL (deployed on Render)
const PRODUCTION_API_URL = "https://my-notify-trading-bot.onrender.com";
const LOCAL_API_URL = "http://localhost:4000";

// Use production URL for GitHub Pages, local for development
const API_BASE_URL = window.location.hostname.includes('github.io') 
  ? PRODUCTION_API_URL 
  : LOCAL_API_URL;

// Configure axios with longer timeout for Render cold starts
const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout for cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const fetchMarketData = async (coin) => {
    return retryRequest(async () => {
        console.log(`🚀 Fetching real-time data from: ${API_BASE_URL}`);
        const response = await apiClient.get(`${API_BASE_URL}/api/getAllIndicators?coin=${coin}`);
        return response.data.success ? response.data.data : [];
    });
};

export const fetchLogs = async () => {
    return retryRequest(async () => {
        const response = await apiClient.get(`${API_BASE_URL}/api/logs`);
        return response.data.success ? response.data.logs : [];
    });
};

export const fetchTradeHistory = async () => {
    return retryRequest(async () => {
        const response = await apiClient.get(`${API_BASE_URL}/api/tradeHistory`);
        return response.data.success ? response.data.trades : [];
    });
};
