import axios from 'axios';

const API_BASE_URL = "http://localhost:4000";

export const fetchMarketData = async (coin) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/getAllIndicators?coin=${coin}`);
        return response.data.success ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching market data:', error);
        return [];
    }
};
