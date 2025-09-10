import axios from 'axios';

// Production backend URL (will be deployed to Render)
const PRODUCTION_API_URL = "https://my-notify-trading-bot.onrender.com";
const LOCAL_API_URL = "http://localhost:4000";

// Use production URL for GitHub Pages, local for development
const API_BASE_URL = window.location.hostname.includes('github.io') 
  ? PRODUCTION_API_URL 
  : LOCAL_API_URL;

export const fetchMarketData = async (coin) => {
    try {
        console.log(`🚀 Fetching real-time data from: ${API_BASE_URL}`);
        const response = await axios.get(`${API_BASE_URL}/api/getAllIndicators?coin=${coin}`);
        return response.data.success ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error; // Don't fall back to demo - we want real data!
    }
};

export const fetchLogs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/logs`);
        return response.data.success ? response.data.logs : [];
    } catch (error) {
        console.error('Error fetching logs:', error);
        return [];
    }
};

export const fetchTradeHistory = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/tradeHistory`);
        return response.data.success ? response.data.trades : [];
    } catch (error) {
        console.error('Error fetching trade history:', error);
        return [];
    }
};
