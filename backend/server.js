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

app.get('/api/getAllIndicators', async (req, res) => {
  try {
    const coin = (req.query.coin || 'bitcoin').toLowerCase();
    const symbol = BINANCE_SYMBOLS[coin];
    if (!symbol) {
      return res.status(400).json({ success:false, error:'Nepoznat coin' });
    }

    const results = [];
    for (const tf of TIMEFRAMES) {
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tf}&limit=100`;
      const resp = await axios.get(url);
      const klines = resp.data || [];

      if (!klines.length) {
        results.push({
          timeframe: tf,
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
          timeframeChange: '0%'
        });
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
    }

    return res.json({ success:true, data:results });
  } catch(err){
    console.error(err);
    return res.status(500).json({ success:false, error:err.message });
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
