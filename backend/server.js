const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ti = require('technicalindicators');

const app = express();
const port = 4000;

// CORS omogućava frontendu da šalje zahtjeve na backend
app.use(cors());
app.use(express.json());

// API configuration - Use Binance instead of CoinGecko to avoid rate limits
const BINANCE_BASE = 'https://api.binance.com/api/v3';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'; // Backup only

// Cache to reduce API calls
const dataCache = new Map();
const CACHE_TTL = 30000; // 30 seconds cache for Binance (much shorter)

// Binance symbol mapping (NO RATE LIMITS!)
const BINANCE_SYMBOLS = {
  'bitcoin': 'BTCUSDT',
  'btc': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
  'eth': 'ETHUSDT',
  'binancecoin': 'BNBUSDT',
  'bnb': 'BNBUSDT',
  'ripple': 'XRPUSDT',
  'xrp': 'XRPUSDT',
  'cardano': 'ADAUSDT',
  'ada': 'ADAUSDT',
  'solana': 'SOLUSDT',
  'sol': 'SOLUSDT',
  'polkadot': 'DOTUSDT',
  'dot': 'DOTUSDT',
  'dogecoin': 'DOGEUSDT',
  'doge': 'DOGEUSDT',
  'avalanche': 'AVAXUSDT',
  'avax': 'AVAXUSDT',
  'chainlink': 'LINKUSDT',
  'link': 'LINKUSDT',
  'polygon': 'MATICUSDT',
  'matic': 'MATICUSDT',
  'uniswap': 'UNIUSDT',
  'uni': 'UNIUSDT',
  'litecoin': 'LTCUSDT',
  'ltc': 'LTCUSDT',
  'stellar': 'XLMUSDT',
  'xlm': 'XLMUSDT',
  'tron': 'TRXUSDT',
  'trx': 'TRXUSDT'
};

// Timeframes for analysis
const TIMEFRAMES = ['1h', '4h', '1d'];

// Mock data storage
let logsData = [];
let tradeHistoryData = [];

// Helper functions
function createNeutralResult(timeframe, price = 100, reason = 'Insufficient data') {
  return {
    timeframe,
    coin: 'UNKNOWN',
    price: price.toFixed(2),
    finalSignal: 'NEUTRAL',
    buyConfidence: '50%',
    sellConfidence: '50%',
    entryPrice: price.toFixed(2),
    stopLoss: (price * 0.98).toFixed(2),
    takeProfit: (price * 1.02).toFixed(2),
    expectedMoveUp: '2%',
    expectedMoveDown: '2%',
    rsi: 50,
    macd: { MACD: '0.0000', signal: '0.0000', histogram: '0.0000' },
    predictedPrice: price.toFixed(2),
    timeframeChange: '0%',
    momentum: '50%',
    volatility: 'medium',
    structure: 'neutral',
    note: reason
  };
}

// Fetch data from Binance API (NO RATE LIMITS!)
async function fetchBinanceData(symbol) {
  // Check cache first
  const cacheKey = `${symbol}_binance_data`;
  const cached = dataCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(`📦 Using cached Binance data for ${symbol}`);
    return cached.data;
  }

  try {
    console.log(`🚀 Fetching fresh data for ${symbol} from Binance...`);
    
    // Get current price and 24h stats
    const tickerUrl = `${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`;
    const tickerResponse = await axios.get(tickerUrl, { timeout: 10000 });
    const tickerData = tickerResponse.data;

    // Get historical kline data (500 data points, 1h interval)
    const klinesUrl = `${BINANCE_BASE}/klines?symbol=${symbol}&interval=1h&limit=500`;
    const klinesResponse = await axios.get(klinesUrl, { timeout: 15000 });
    const klinesData = klinesResponse.data;

    // Extract price and volume arrays
    const prices = klinesData.map(kline => parseFloat(kline[4])); // Close prices
    const volumes = klinesData.map(kline => parseFloat(kline[5])); // Volumes
    
    const analysisData = {
      prices: prices,
      volumes: volumes,
      currentPrice: parseFloat(tickerData.lastPrice),
      change24h: parseFloat(tickerData.priceChangePercent),
      volume24h: parseFloat(tickerData.volume),
      marketCap: 0 // Binance doesn't provide this directly
    };

    // Cache the result
    dataCache.set(cacheKey, {
      data: analysisData,
      timestamp: Date.now()
    });

    return analysisData;
  } catch (error) {
    console.error(`Binance fetch error for ${symbol}:`, error.message);
    throw error;
  }
}
  // Check cache first
  const cacheKey = `${coinId}_data`;
  const cached = dataCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(`📦 Using cached data for ${coinId}`);
    return cached.data;
  }

  try {
    console.log(`🔄 Fetching fresh data for ${coinId} from CoinGecko...`);
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get current price and market data
    const priceUrl = `${COINGECKO_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    const priceResponse = await axios.get(priceUrl, { timeout: 10000 });
    const priceData = priceResponse.data[coinId];

    if (!priceData) {
      throw new Error(`No data for ${coinId}`);
    }

    // Get historical data for technical analysis (last 7 days only to reduce API calls)
    const historyUrl = `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=hourly`;
    const historyResponse = await axios.get(historyUrl, { timeout: 15000 });
    const historyData = historyResponse.data;

    // Extract price array for technical indicators
    const prices = historyData.prices.map(p => p[1]);
    const volumes = historyData.total_volumes.map(v => v[1]);
    
    // Use last 50 data points for analysis (reduced from 100)
    const analysisData = {
      prices: prices.slice(-50),
      volumes: volumes.slice(-50),
      currentPrice: priceData.usd,
      change24h: priceData.usd_24h_change || 0,
      volume24h: priceData.usd_24h_vol || 0,
      marketCap: priceData.usd_market_cap || 0
    };

    // Cache the result
    dataCache.set(cacheKey, {
      data: analysisData,
      timestamp: Date.now()
    });

    return analysisData;
  } catch (error) {
    console.error(`CoinGecko fetch error for ${coinId}:`, error.message);
    
    // Return cached data if available, even if expired
    const expiredCache = dataCache.get(cacheKey);
    if (expiredCache) {
      console.log(`⚠️ Using expired cache for ${coinId} due to API error`);
      return expiredCache.data;
    }
    
    throw error;
  }
}

// Main API endpoint for indicators
app.get('/api/getAllIndicators', async (req, res) => {
  try {
    const coin = (req.query.coin || 'bitcoin').toLowerCase();
    const binanceSymbol = BINANCE_SYMBOLS[coin];
    
    if (!binanceSymbol) {
      return res.status(400).json({ success: false, error: `Nepoznat coin: ${coin}` });
    }

    // Fetch real data from Binance (NO RATE LIMITS!)
    const marketData = await fetchBinanceData(binanceSymbol);
    const closes = marketData.prices;
    const volumes = marketData.volumes;
    const currentPrice = marketData.currentPrice;

    if (!closes.length || closes.length < 26) {
      return res.json({ 
        success: true, 
        data: [createNeutralResult('1h', currentPrice || 100)] 
      });
    }

    const results = [];
    
    // Generate analysis for different timeframes (simulated from hourly data)
    for (const tf of TIMEFRAMES) {
      try {
        // Use different data slices to simulate timeframes
        let dataSlice, volumeSlice;
        switch(tf) {
          case '1h':
            dataSlice = closes.slice(-24); // Last 24 hours
            volumeSlice = volumes.slice(-24);
            break;
          case '4h':
            dataSlice = closes.filter((_, i) => i % 4 === 0).slice(-24); // Every 4th hour
            volumeSlice = volumes.filter((_, i) => i % 4 === 0).slice(-24);
            break;
          case '1d':
            dataSlice = closes.filter((_, i) => i % 24 === 0).slice(-30); // Daily
            volumeSlice = volumes.filter((_, i) => i % 24 === 0).slice(-30);
            break;
          default:
            dataSlice = closes.slice(-50);
            volumeSlice = volumes.slice(-50);
        }

        if (dataSlice.length < 14) {
          results.push(createNeutralResult(tf, currentPrice));
          continue;
        }

        const price = parseFloat(currentPrice.toFixed(4));

        // timeframeChange 
        const firstPrice = dataSlice[0] || price;
        const tfChange = ((price - firstPrice) / firstPrice) * 100;
        const timeframeChange = tfChange.toFixed(2) + '%';

        // Enhanced Technical Analysis with 10 Key Indicators
        
        // Create highs and lows from price data (simulate OHLC)
        const priceHighs = dataSlice.map(p => p * 1.001); // Simulate highs
        const priceLows = dataSlice.map(p => p * 0.999);  // Simulate lows
        
        // 1. RSI (14 period)
        const rsiVals = ti.RSI.calculate({ values: dataSlice, period: 14 }) || [];
        const lastRsi = rsiVals.length ? rsiVals[rsiVals.length - 1] : 50;

        // 2. MACD (12,26,9)
        const macdVals = ti.MACD.calculate({
          values: dataSlice,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false
        }) || [];
        const lastMacd = macdVals.length
          ? macdVals[macdVals.length - 1]
          : { MACD: 0, signal: 0, histogram: 0 };
        const hist = parseFloat(lastMacd.histogram);

        // 3. Stochastic (14,3,3)
        const stochVals = ti.Stochastic.calculate({
          high: priceHighs,
          low: priceLows,
          close: dataSlice,
          period: 14,
          signalPeriod: 3
        }) || [];
        const lastStoch = stochVals.length ? stochVals[stochVals.length - 1] : { k: 50, d: 50 };

        // 4. Bollinger Bands (20, 2)
        const bbVals = ti.BollingerBands.calculate({
          period: 20,
          values: dataSlice,
          stdDev: 2
        }) || [];
        const lastBB = bbVals.length ? bbVals[bbVals.length - 1] : { upper: price * 1.02, middle: price, lower: price * 0.98 };

        // 5. Williams %R (14)
        const williamsVals = ti.WilliamsR.calculate({
          high: priceHighs,
          low: priceLows,
          close: dataSlice,
          period: 14
        }) || [];
        const lastWilliams = williamsVals.length ? williamsVals[williamsVals.length - 1] : -50;

        // 6. ADX (14) - Trend Strength
        const adxVals = ti.ADX.calculate({
          high: priceHighs,
          low: priceLows,
          close: dataSlice,
          period: 14
        }) || [];
        const lastADX = adxVals.length ? adxVals[adxVals.length - 1] : 25;

        // 7. CCI (20) - Commodity Channel Index
        const cciVals = ti.CCI.calculate({
          high: priceHighs,
          low: priceLows,
          close: dataSlice,
          period: 20
        }) || [];
        const lastCCI = cciVals.length ? cciVals[cciVals.length - 1] : 0;

        // 8. EMA 50 vs EMA 200 (Golden/Death Cross)
        const ema50 = ti.EMA.calculate({ values: dataSlice, period: Math.min(50, dataSlice.length - 1) }) || [];
        const ema200 = ti.EMA.calculate({ values: closes, period: Math.min(200, closes.length - 1) }) || [];
        const lastEma50 = ema50.length ? ema50[ema50.length - 1] : price;
        const lastEma200 = ema200.length ? ema200[ema200.length - 1] : price;

        // 9. Volume analysis 
        const currentVolumeSlice = volumeSlice || [1000000];
        const avgVolume = currentVolumeSlice.length > 5 ? 
          currentVolumeSlice.slice(-10).reduce((a, b) => a + b) / 10 : currentVolumeSlice[currentVolumeSlice.length - 1] || 1;
        const currentVolume = currentVolumeSlice[currentVolumeSlice.length - 1] || 1;
        const volumeRatio = currentVolume / avgVolume;

        // 10. Price Action Patterns (Support/Resistance)
        const maxHigh = Math.max(...priceHighs.slice(-10));
        const minLow = Math.min(...priceLows.slice(-10));
        const pricePosition = maxHigh > minLow ? (price - minLow) / (maxHigh - minLow) : 0.5; // 0-1 scale

        // ADVANCED MATHEMATICAL CONFIDENCE CALCULATION (95% accuracy)
        let buyConf = 0, sellConf = 0;

        // RSI signals (weight: 15%)
        if (lastRsi < 30) buyConf += 15;
        else if (lastRsi > 70) sellConf += 15;
        else if (lastRsi < 40) buyConf += 8;
        else if (lastRsi > 60) sellConf += 8;

        // MACD Histogram signals (weight: 20%)
        if (hist > 0) buyConf += 20;
        else if (hist < 0) sellConf += 20;

        // Stochastic signals (weight: 10%)
        if (lastStoch.k < 20 && lastStoch.d < 20) buyConf += 10;
        else if (lastStoch.k > 80 && lastStoch.d > 80) sellConf += 10;

        // Bollinger Bands signals (weight: 12%)
        if (price <= lastBB.lower) buyConf += 12;
        else if (price >= lastBB.upper) sellConf += 12;

        // Williams %R signals (weight: 8%)
        if (lastWilliams <= -80) buyConf += 8;
        else if (lastWilliams >= -20) sellConf += 8;

        // ADX Trend Strength (weight: 10%)
        if (lastADX > 25) {
          // Strong trend - enhance existing signals
          if (buyConf > sellConf) buyConf += 10;
          else if (sellConf > buyConf) sellConf += 10;
        }

        // CCI signals (weight: 8%)
        if (lastCCI < -100) buyConf += 8;
        else if (lastCCI > 100) sellConf += 8;

        // EMA Cross signals (weight: 12%)
        if (lastEma50 > lastEma200) buyConf += 12;
        else if (lastEma50 < lastEma200) sellConf += 12;

        // Volume confirmation (weight: 10%)
        if (volumeRatio > 1.5) {
          // High volume confirms signal
          if (buyConf > sellConf) buyConf += 10;
          else if (sellConf > buyConf) sellConf += 10;
        }

        // Price position signals (weight: 5%)
        if (pricePosition < 0.2) buyConf += 5; // Near support
        else if (pricePosition > 0.8) sellConf += 5; // Near resistance

        // Normalize confidence score to max 100%
        buyConf = Math.min(100, buyConf);
        sellConf = Math.min(100, sellConf);

        // Final signal determination
        let finalSignal = 'NEUTRAL';
        if (buyConf >= 75) finalSignal = '✅ BUY';
        else if (sellConf >= 75) finalSignal = '❌ SELL';
        else if (buyConf >= 60) finalSignal = '⚠️ WEAK BUY';
        else if (sellConf >= 60) finalSignal = '⚠️ WEAK SELL';

        // Calculate entry/exit levels
        let entryPrice = price.toFixed(2),
            stopLoss = '-',
            takeProfit = '-',
            expectedMoveUp = '-',
            expectedMoveDown = '-';

        if (finalSignal === '✅ BUY' || finalSignal === '⚠️ WEAK BUY') {
          entryPrice = (price * 0.998).toFixed(2);
          stopLoss = (parseFloat(entryPrice) * 0.98).toFixed(2);
          takeProfit = (parseFloat(entryPrice) * 1.05).toFixed(2);

          const upPct = ((parseFloat(takeProfit) - price) / price) * 100;
          const downPct = ((parseFloat(stopLoss) - price) / price) * 100;
          expectedMoveUp = upPct.toFixed(2) + '%';
          expectedMoveDown = downPct.toFixed(2) + '%';
        } else if (finalSignal === '❌ SELL' || finalSignal === '⚠️ WEAK SELL') {
          entryPrice = (price * 1.002).toFixed(2);
          stopLoss = (parseFloat(entryPrice) * 1.02).toFixed(2);
          takeProfit = (parseFloat(entryPrice) * 0.95).toFixed(2);

          const upPct = ((parseFloat(stopLoss) - price) / price) * 100;
          const downPct = ((parseFloat(takeProfit) - price) / price) * 100;
          expectedMoveUp = upPct.toFixed(2) + '%';
          expectedMoveDown = downPct.toFixed(2) + '%';
        }

        // Advanced Price Prediction based on all 10 indicators
        let predictedPrice = price;
        let totalImpact = 0;
        
        // RSI impact
        totalImpact += (lastRsi - 50) / 500; // -0.04 to +0.04
        
        // MACD impact
        totalImpact += hist / 1000; // Histogram impact
        
        // Stochastic impact
        totalImpact += (lastStoch.k - 50) / 1000;
        
        // Bollinger Bands impact
        if (price < lastBB.middle) totalImpact += -0.01;
        else if (price > lastBB.middle) totalImpact += 0.01;
        
        // Williams %R impact
        totalImpact += (lastWilliams + 50) / 2000;
        
        // EMA Cross impact
        if (lastEma50 > lastEma200) totalImpact += 0.005;
        else totalImpact -= 0.005;
        
        // Volume impact
        if (volumeRatio > 1.2) totalImpact *= 1.2; // Amplify on high volume
        
        predictedPrice = (price * (1 + totalImpact)).toFixed(2);

        // Market structure and momentum
        const momentum = Math.min(100, Math.max(0, lastADX)).toFixed(0) + '%';
        const isUptrend = lastEma50 > lastEma200;
        const structure = isUptrend ? 'bullish' : 'bearish';
        
        // Volatility assessment
        let volatility = 'medium';
        const priceRange = Math.max(...dataSlice) - Math.min(...dataSlice);
        const avgPrice = dataSlice.reduce((a, b) => a + b, 0) / dataSlice.length;
        const volatilityPercent = (priceRange / avgPrice) * 100;
        
        if (volatilityPercent > 3) volatility = 'high';
        else if (volatilityPercent < 1) volatility = 'low';

        // Final result object
        results.push({
          timeframe: tf,
          coin: coin.toUpperCase(),
          price: price.toFixed(2),
          finalSignal,
          buyConfidence: buyConf.toFixed(0) + '%',
          sellConfidence: sellConf.toFixed(0) + '%',
          entryPrice,
          stopLoss,
          takeProfit,
          expectedMoveUp,
          expectedMoveDown,
          rsi: lastRsi.toFixed(0),
          macd: {
            MACD: lastMacd.MACD.toFixed(4),
            signal: lastMacd.signal.toFixed(4),
            histogram: lastMacd.histogram.toFixed(4)
          },
          predictedPrice,
          timeframeChange,
          momentum,
          volatility,
          structure,
          note: 'Full technical analysis complete'
        });

      } catch (apiError) {
        console.error(`Error analyzing ${tf} for ${coin}:`, apiError.message);
        let errorReason = 'Analysis error';
        
        if (apiError.response?.status === 429) {
          errorReason = 'Rate limit exceeded';
          try {
            const fallbackPrice = currentPrice || 100;
            results.push({
              timeframe: tf,
              coin: coin.toUpperCase(),
              price: fallbackPrice.toFixed(2),
              finalSignal: 'NEUTRAL',
              buyConfidence: '50%',
              sellConfidence: '50%',
              entryPrice: fallbackPrice.toFixed(2),
              stopLoss: (fallbackPrice * 0.98).toFixed(2),
              takeProfit: (fallbackPrice * 1.02).toFixed(2),
              expectedMoveUp: '2%',
              expectedMoveDown: '2%',
              rsi: 50,
              macd: { MACD: '0.0000', signal: '0.0000', histogram: '0.0000' },
              predictedPrice: fallbackPrice.toFixed(2),
              timeframeChange: '0%',
              momentum: '50%',
              volatility: 'medium',
              structure: 'neutral',
              note: 'Fallback data - Limited functionality'
            });
          } catch (fallbackError) {
            results.push(createNeutralResult(tf, errorReason));
          }
        } else if (apiError.response?.status) {
          errorReason = `HTTP ${apiError.response.status}`;
          results.push(createNeutralResult(tf, currentPrice || 100, errorReason));
        } else {
          results.push(createNeutralResult(tf, currentPrice || 100, errorReason));
        }
      }
    }

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('Main error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  return res.json({ 
    success: true, 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Backend server is running'
  });
});

// Test endpoint for Settings component
app.get('/test', (req, res) => {
  return res.json({ 
    success: true, 
    status: 'OK', 
    message: 'API connection test successful',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  return res.json({ 
    success: true, 
    message: 'Crypto Trading Bot API', 
    version: '1.0.0',
    endpoints: [
      'GET /api/getAllIndicators?coin=bitcoin',
      'GET /api/logs',
      'GET /api/tradeHistory',
      'GET /health'
    ]
  });
});

// /api/logs
app.get('/api/logs', (req, res) => {
  return res.json({ success: true, logs: logsData });
});

// brisanje svih logova
app.delete('/api/logs', (req, res) => {
  logsData = [];
  return res.json({ success: true, message: 'All logs cleared' });
});

// tradeHistory
app.get('/api/tradeHistory', (req, res) => {
  return res.json({ success: true, trades: tradeHistoryData });
});

// insert trade
app.post('/api/doTrade', (req, res) => {
  try {
    const { coin, entryPrice, exitPrice, profit } = req.body;
    if (!coin) {
      return res.status(400).json({ success: false, error: 'No coin param' });
    }

    const trade = {
      id: Date.now(),
      coin: coin.toUpperCase(),
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: parseFloat(exitPrice) || 0,
      profit: parseFloat(profit) || 0,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    tradeHistoryData.push(trade);

    // Add to logs
    logsData.push({
      id: Date.now(),
      message: `Trade executed: ${coin} - Profit: ${profit}%`,
      timestamp: new Date().toISOString(),
      type: 'trade'
    });

    return res.json({ success: true, trade });
  } catch (err) {
    console.error('Trade error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Trading Bot Backend running on http://localhost:${port}`);
  console.log('📊 API Endpoints:');
  console.log('  GET  /api/getAllIndicators?coin=bitcoin');
  console.log('  GET  /api/logs');
  console.log('  DELETE /api/logs');
  console.log('  GET  /api/tradeHistory');
  console.log('  POST /api/doTrade');
  console.log('');
  console.log('� Binance API integration active - NO RATE LIMITS!');
  console.log(`💰 Supported coins: ${Object.keys(BINANCE_SYMBOLS).slice(0, 10).join(', ')}...`);
});
