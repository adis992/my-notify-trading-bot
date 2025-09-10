require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ti = require('technicalindicators');

const app = express();

// Enhanced CORS for production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://adis992.github.io'
  ],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 4000;

// Health check endpoint for hosting services
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Trade Bot API is running', 
    version: '1.0.0',
    endpoints: ['/health', '/api/getAllIndicators', '/api/logs', '/api/tradeHistory']
  });
});

const BINANCE_SYMBOLS = {
  bitcoin: 'BTCUSDT',
  ethereum: 'ETHUSDT',
  solana: 'SOLUSDT',
  cardano: 'ADAUSDT',
  dogecoin: 'DOGEUSDT',
  xrp: 'XRPUSDT',
  litecoin: 'LTCUSDT',
  polkadot: 'DOTUSDT',
  chainlink: 'LINKUSDT',
  avalanche: 'AVAXUSDT'
};

// Timeframes
const TIMEFRAMES = ['3m','5m','15m','30m','1h','2h','4h','12h','1d'];

let logsData = [];
let tradeHistoryData = [];

// Helper function for neutral result
function createNeutralResult(timeframe, errorReason = 'No data') {
  return {
    timeframe: timeframe,
    price: 0,
    finalSignal: 'NEUTRAL',
    buyConfidence: '0%',
    sellConfidence: '0%',
    entryPrice: '-',
    stopLoss: '-',
    takeProfit: '-',
    expectedMoveUp: '-',
    expectedMoveDown: '-',
    rsi: 50,
    macd: { MACD: 0, signal: 0, histogram: 0 },
    predictedPrice: 0,
    timeframeChange: '0%',
    error: errorReason
  };
}

// Alternative crypto data sources when Binance is blocked
const CRYPTO_APIS = {
  coingecko: 'https://api.coingecko.com/api/v3',
  coinbase: 'https://api.coinbase.com/v2',
  kraken: 'https://api.kraken.com/0/public'
};

const SYMBOL_MAPPING = {
  'BTCUSDT': { coingecko: 'bitcoin', coinbase: 'BTC-USD' },
  'ETHUSDT': { coingecko: 'ethereum', coinbase: 'ETH-USD' },
  'SOLUSDT': { coingecko: 'solana', coinbase: 'SOL-USD' },
  'ADAUSDT': { coingecko: 'cardano', coinbase: 'ADA-USD' },
  'DOGEUSDT': { coingecko: 'dogecoin', coinbase: 'DOGE-USD' },
  'XRPUSDT': { coingecko: 'ripple', coinbase: 'XRP-USD' },
  'LTCUSDT': { coingecko: 'litecoin', coinbase: 'LTC-USD' },
  'DOTUSDT': { coingecko: 'polkadot', coinbase: 'DOT-USD' },
  'LINKUSDT': { coingecko: 'chainlink', coinbase: 'LINK-USD' },
  'AVAXUSDT': { coingecko: 'avalanche-2', coinbase: 'AVAX-USD' }
};

// Get real crypto data from alternative sources
async function getRealCryptoData(symbol) {
  const mapping = SYMBOL_MAPPING[symbol];
  if (!mapping) {
    throw new Error(`No mapping for ${symbol}`);
  }

  console.log(`🔄 Trying alternative APIs for ${symbol}...`);

  // Try CoinGecko first (most reliable)
  try {
    const coingeckoId = mapping.coingecko;
    const url = `${CRYPTO_APIS.coingecko}/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TradingBot/1.0'
      },
      timeout: 15000
    });

    const data = response.data[coingeckoId];
    if (data && data.usd) {
      console.log(`✅ CoinGecko success for ${symbol}: $${data.usd}`);
      return {
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        volume: data.usd_24h_vol || 0
      };
    }
  } catch (error) {
    console.log(`❌ CoinGecko failed for ${symbol}:`, error.message);
  }

  // Try Coinbase as backup
  try {
    const coinbaseSymbol = mapping.coinbase;
    const url = `${CRYPTO_APIS.coinbase}/exchange-rates?currency=${coinbaseSymbol.split('-')[0]}`;
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TradingBot/1.0'
      },
      timeout: 10000
    });

    const rate = response.data?.data?.rates?.USD;
    if (rate) {
      console.log(`✅ Coinbase success for ${symbol}: $${rate}`);
      return {
        price: parseFloat(rate),
        change24h: 0, // Coinbase doesn't provide 24h change in this endpoint
        volume: 0
      };
    }
  } catch (error) {
    console.log(`❌ Coinbase failed for ${symbol}:`, error.message);
  }

  throw new Error(`All alternative APIs failed for ${symbol}`);
}

app.get('/api/getAllIndicators', async (req, res) => {
  console.log('🚀 getAllIndicators called at:', new Date().toISOString());
  
  try {
    const coin = (req.query.coin || 'bitcoin').toLowerCase();
    const symbol = BINANCE_SYMBOLS[coin];
    
    console.log('📊 Processing:', coin, '→', symbol);
    
    if (!symbol) {
      console.error('❌ Unknown coin:', coin);
      return res.status(400).json({ success:false, error:'Nepoznat coin' });
    }

    const results = [];
    for (const tf of TIMEFRAMES) {
      try {
        // Try multiple Binance endpoints for REAL data
        let klines = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!klines && attempts < maxAttempts) {
          attempts++;
          
          try {
            const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tf}&limit=100`;
            
            // Enhanced headers for Binance API
            const resp = await axios.get(url, {
              headers: {
                'User-Agent': attempts === 1 ? 'Mozilla/5.0 (compatible; TradingBot/1.0)' : 
                             attempts === 2 ? 'curl/7.68.0' : 'PostmanRuntime/7.26.8',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
              },
              timeout: 15000 + (attempts * 5000) // Increase timeout per attempt
            });
            
            klines = resp.data || [];
            console.log(`✅ SUCCESS: Got ${klines.length} klines for ${symbol} ${tf} on attempt ${attempts}`);
            
          } catch (attemptError) {
            console.log(`❌ Attempt ${attempts} failed for ${symbol} ${tf}:`, attemptError.response?.status);
            if (attempts === maxAttempts) {
              throw attemptError; // Throw on final attempt
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          }
        }

        if (!klines || !klines.length) {
          console.error(`⚠️ WARNING: No klines data received for ${symbol} ${tf}`);
          results.push({
            timeframe: tf,
            price: 0,
            finalSignal: 'NO_DATA',
            buyConfidence: '0%',
            sellConfidence: '0%',
            entryPrice: '-',
            stopLoss: '-',
            takeProfit: '-',
            expectedMoveUp: '-',
            expectedMoveDown: '-',
            rsi: 0,
            macd: { MACD: 0, signal: 0, histogram: 0 },
            predictedPrice: 0,
            timeframeChange: '0%',
            error: 'NO KLINES DATA FROM BINANCE'
          });
          continue;
        }

        // Validate klines data structure
        if (!Array.isArray(klines) || !klines[0] || klines[0].length < 5) {
          console.error(`⚠️ WARNING: Invalid klines structure for ${symbol} ${tf}`);
          continue;
        }

        const closes = klines.map(k => parseFloat(k[4]));
        const lastPrice = closes[closes.length - 1] || 0;
        const price = parseFloat(lastPrice.toFixed(2));

      // timeframeChange
      const firstPrice = closes[0]||1;
      const tfChange = ((price - firstPrice)/ firstPrice)*100;
      const timeframeChange = tfChange.toFixed(2)+'%';

      // RSI
      const rsiVals = ti.RSI.calculate({ values: closes, period:14 }) || [];
      const lastRsi = rsiVals.length ? rsiVals[rsiVals.length -1] : 50;

      // MACD
      const macdVals = ti.MACD.calculate({
        values: closes,
        fastPeriod:12,
        slowPeriod:26,
        signalPeriod:9,
        SimpleMAOscillator:false,
        SimpleMASignal:false
      })||[];
      const lastMacd = macdVals.length
        ? macdVals[macdVals.length-1]
        : { MACD:0, signal:0, histogram:0 };
      const hist = parseFloat(lastMacd.histogram);

      let buyConf=0, sellConf=0;
      if (lastRsi <30) buyConf+=20;
      if (lastRsi >70) sellConf+=20;
      if (hist>0) buyConf+=20;
      if (hist<0) sellConf+=20;

      let finalSignal='NEUTRAL';
      if(buyConf> sellConf) finalSignal='✅ BUY';
      else if(sellConf> buyConf) finalSignal='❌ SELL';

      let entryPrice='-',
          stopLoss='-',
          takeProfit='-',
          expectedMoveUp='-',
          expectedMoveDown='-';

      if(finalSignal==='✅ BUY'){
        entryPrice = (price*0.998).toFixed(2);
        stopLoss   = (parseFloat(entryPrice)*0.98).toFixed(2);
        takeProfit = (parseFloat(entryPrice)*1.05).toFixed(2);

        const upPct = ((parseFloat(takeProfit)-price)/price)*100;
        const downPct= ((parseFloat(stopLoss)-price)/price)*100;
        expectedMoveUp= upPct.toFixed(2);
        expectedMoveDown= downPct.toFixed(2);
      } else if(finalSignal==='❌ SELL'){
        entryPrice = (price*1.002).toFixed(2);
        stopLoss   = (parseFloat(entryPrice)*1.02).toFixed(2);
        takeProfit = (parseFloat(entryPrice)*0.95).toFixed(2);

        const upPct = ((parseFloat(stopLoss)-price)/price)*100;
        const downPct= ((parseFloat(takeProfit)-price)/price)*100;
        expectedMoveUp= upPct.toFixed(2);
        expectedMoveDown= downPct.toFixed(2);
      }

      // Predikcija
      let predictedPrice= price;
      let impact=0;
      impact += (lastRsi-50)/200;
      impact += hist/500;
      impact += (buyConf - sellConf)/100;
      predictedPrice += predictedPrice* impact;
      predictedPrice = parseFloat(predictedPrice.toFixed(2));

      const rowObj={
        timeframe: tf,
        price,
        finalSignal,
        buyConfidence: buyConf+'%',
        sellConfidence: sellConf+'%',
        // zaokruživanje RSI, MACD, PREDICT
        rsi: parseFloat(lastRsi.toFixed(2)),
        macd: {
          MACD: parseFloat(lastMacd.MACD.toFixed(2)),
          signal: parseFloat(lastMacd.signal.toFixed(2)),
          histogram: parseFloat(hist.toFixed(2))
        },
        predictedPrice: parseFloat(predictedPrice.toFixed(2)),

        // entry/SL/TP
        entryPrice,
        stopLoss,
        takeProfit,
        expectedMoveUp,
        expectedMoveDown,
        timeframeChange
      };
      results.push(rowObj);

      // Log
      const now = new Date().toISOString().replace('T',' ').split('.')[0];
      logsData.push({
        time: now,
        coin,
        timeframe: tf,
        oldSignal:'N/A',
        newSignal: finalSignal,
        reason:`RSI=${lastRsi}, MACD=${hist}`
      });

      // Limit logs na 1000
      if (logsData.length>1000){
        logsData.shift(); // brišemo najstariji
      }
      
    } catch (apiError) {
      // Handle individual API errors (like 451)
      console.error(`❌ Binance API Error for ${tf}:`, apiError.response?.status, apiError.message);
      
      // Since Binance is blocked, try alternative crypto APIs for REAL data
      try {
        console.log(`🔄 Binance blocked for ${tf}, trying alternative APIs...`);
        const altData = await getRealCryptoData(symbol);
        
        // Create result with real price from alternative API
        const realPrice = altData.price;
        const change24h = altData.change24h;
        
        results.push({
          timeframe: tf,
          price: realPrice,
          finalSignal: 'NEUTRAL',
          buyConfidence: '50%',
          sellConfidence: '50%',
          entryPrice: realPrice.toFixed(2),
          stopLoss: (realPrice * 0.98).toFixed(2),
          takeProfit: (realPrice * 1.02).toFixed(2),
          expectedMoveUp: '2%',
          expectedMoveDown: '2%',
          rsi: 50, // Can't calculate without historical data
          macd: { MACD: 0, signal: 0, histogram: 0 },
          predictedPrice: realPrice,
          timeframeChange: change24h ? `${change24h.toFixed(2)}%` : '0%',
          note: `Real price from CoinGecko/Coinbase (Binance blocked)`,
          source: 'alternative_api'
        });
        
        console.log(`✅ Got real price for ${symbol} ${tf}: $${realPrice}`);
        
      } catch (altError) {
        console.error(`💥 ALL APIs failed for ${symbol} ${tf}:`, altError.message);
        
        // If even alternative APIs fail, show clear error
        results.push({
          timeframe: tf,
          price: 0,
          finalSignal: 'ERROR',
          buyConfidence: '0%',
          sellConfidence: '0%',
          entryPrice: '-',
          stopLoss: '-',
          takeProfit: '-',
          expectedMoveUp: '-',
          expectedMoveDown: '-',
          rsi: 0,
          macd: { MACD: 0, signal: 0, histogram: 0 },
          predictedPrice: 0,
          timeframeChange: '0%',
          error: 'ALL CRYPTO APIs BLOCKED OR FAILED',
          source: 'error'
        });
      }
          console.error('ALL BINANCE ENDPOINTS FAILED FOR', symbol);
          results.push({
            timeframe: tf,
            price: 0,
            finalSignal: 'ERROR',
            buyConfidence: '0%',
            sellConfidence: '0%',
            entryPrice: '-',
            stopLoss: '-',
            takeProfit: '-',
            expectedMoveUp: '-',
            expectedMoveDown: '-',
            rsi: 0,
            macd: { MACD: 0, signal: 0, histogram: 0 },
          error: 'ALL CRYPTO APIs BLOCKED OR FAILED',
          source: 'error'
        });
      }
    }

    console.log('✅ Successfully processed', results.length, 'timeframes for', symbol);
    return res.json({ success:true, data:results });
  } catch(err){
    console.error('💥 CRITICAL ERROR in getAllIndicators:', err);
    console.error('Error details:', err.response?.status, err.message);
    return res.status(500).json({ 
      success:false, 
      error: `Backend error: ${err.message}`,
      details: err.response?.status ? `HTTP ${err.response.status}` : 'Unknown error'
    });
  }
});

// /api/logs
app.get('/api/logs', (req, res)=>{
  return res.json({ success:true, logs: logsData });
});

// brisanje svih logova ako želiš
app.delete('/api/logs', (req, res)=>{
  logsData=[];
  return res.json({ success:true, message:'All logs cleared' });
});

// tradeHistory
app.get('/api/tradeHistory', (req, res)=>{
  return res.json({ success:true, trades: tradeHistoryData });
});

// insert trade
app.post('/api/doTrade', (req, res)=>{
  try{
    const { coin, entryPrice, exitPrice, profit } = req.body;
    if(!coin){
      return res.status(400).json({ success:false, error:'No coin param' });
    }
    const now = new Date().toISOString().replace('T',' ').split('.')[0];
    const tradeObj={
      time: now,
      coin,
      entryPrice: entryPrice||'-',
      exitPrice: exitPrice||'-',
      profit: parseFloat(profit)||0
    };
    tradeHistoryData.push(tradeObj);
    return res.json({ success:true, message:'Trade snimljen', trade: tradeObj });
  }catch(err){
    return res.status(500).json({ success:false, error:err.message});
  }
});

app.listen(PORT, ()=>{
  console.log(`Server radi na portu ${PORT}`);
});
