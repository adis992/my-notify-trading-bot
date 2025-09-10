import axios from 'axios';

const API_BASE_URL = "http://localhost:4000";

// Demo data for GitHub Pages deployment
const generateDemoData = (coin) => {
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    const basePrice = coin === 'bitcoin' ? 45000 : 
                     coin === 'ethereum' ? 2800 : 
                     coin === 'solana' ? 140 : 180;
    
    return timeframes.map(tf => {
        const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
        const price = basePrice * (1 + variance);
        const rsi = 30 + Math.random() * 40; // RSI between 30-70
        const macdLine = (Math.random() - 0.5) * 2;
        const macdSignal = macdLine + (Math.random() - 0.5) * 0.5;
        const histogram = macdLine - macdSignal;
        
        return {
            coin: coin,
            timeframe: tf,
            price: price.toFixed(2),
            rsi: rsi.toFixed(2),
            macd: {
                line: macdLine.toFixed(4),
                signal: macdSignal.toFixed(4),
                histogram: histogram.toFixed(4)
            },
            buyConfidence: (Math.random() * 100).toFixed(1) + '%',
            sellConfidence: (Math.random() * 100).toFixed(1) + '%',
            prediction: (price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)
        };
    });
};

const generateDemoLogs = () => {
    const coins = ['bitcoin', 'ethereum', 'solana'];
    const timeframes = ['1m', '5m', '15m', '1h'];
    const signals = ['BUY', 'SELL', 'NEUTRAL'];
    const reasons = ['RSI oversold', 'MACD crossover', 'Volume spike', 'Resistance break'];
    
    return Array.from({ length: 10 }, (_, i) => {
        const time = new Date(Date.now() - i * 300000).toLocaleTimeString(); // Every 5 minutes
        return {
            time,
            coin: coins[Math.floor(Math.random() * coins.length)],
            timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
            oldSignal: signals[Math.floor(Math.random() * signals.length)],
            newSignal: signals[Math.floor(Math.random() * signals.length)],
            reason: reasons[Math.floor(Math.random() * reasons.length)]
        };
    });
};

const generateDemoTradeHistory = () => {
    const coins = ['bitcoin', 'ethereum', 'solana'];
    const types = ['BUY', 'SELL'];
    
    return Array.from({ length: 8 }, (_, i) => {
        const time = new Date(Date.now() - i * 1800000).toLocaleTimeString(); // Every 30 minutes
        const coin = coins[Math.floor(Math.random() * coins.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const basePrice = coin === 'bitcoin' ? 45000 : coin === 'ethereum' ? 2800 : 140;
        const price = (basePrice * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2);
        const amount = (Math.random() * 0.1).toFixed(4);
        const profit = ((Math.random() - 0.5) * 500).toFixed(2);
        
        return {
            time,
            coin: coin.toUpperCase(),
            type,
            amount,
            price,
            total: (parseFloat(price) * parseFloat(amount)).toFixed(2),
            profit: profit > 0 ? `+$${profit}` : `-$${Math.abs(profit)}`
        };
    });
};

export const fetchMarketData = async (coin) => {
    // Detect if we're on GitHub Pages (production)
    const isProduction = window.location.hostname.includes('github.io');
    
    if (isProduction) {
        // Use demo data for GitHub Pages
        console.log('🎯 Demo mode activated for GitHub Pages');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateDemoData(coin));
            }, 500); // Simulate API delay
        });
    }
    
    // Local development - try to connect to backend
    try {
        const response = await axios.get(`${API_BASE_URL}/api/getAllIndicators?coin=${coin}`);
        return response.data.success ? response.data.data : [];
    } catch (error) {
        console.error('Error fetching market data:', error);
        console.log('🎯 Falling back to demo data due to backend connection error');
        return generateDemoData(coin);
    }
};

export const fetchLogs = async () => {
    const isProduction = window.location.hostname.includes('github.io');
    
    if (isProduction) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateDemoLogs());
            }, 300);
        });
    }
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/logs`);
        return response.data.success ? response.data.logs : [];
    } catch (error) {
        console.error('Error fetching logs:', error);
        return generateDemoLogs();
    }
};

export const fetchTradeHistory = async () => {
    const isProduction = window.location.hostname.includes('github.io');
    
    if (isProduction) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateDemoTradeHistory());
            }, 400);
        });
    }
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/tradeHistory`);
        return response.data.success ? response.data.trades : [];
    } catch (error) {
        console.error('Error fetching trade history:', error);
        return generateDemoTradeHistory();
    }
};
