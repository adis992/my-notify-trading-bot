const TIMEFRAMES = ['15m', '1H', '4H', '6H', '12H', '1D', '1W', '1M'];
const INDICATORS = [
  'rsi',
  'macd',
  'stoch',
  'bollinger',
  'ema50',
  'ema200',
  'adx',
  'cci',
  'willr',
  'mom' // momentum
];

// Ova funkcija vraća array od 8 timeframe-ova,
// a unutar svakog timeframe-a ima 10 indikatora s vrijednostima i finalnim buy/sell.
export function calculateIndicators(currentPrice) {
  if (!currentPrice) return [];

  return TIMEFRAMES.map(tf => {
    const indData = {};

    // Za svaki indikator, generiši random broj 0-100
    // i odredi buy/sell prema >50 => buy, <50 => sell (ovo je fiktivno!)
    INDICATORS.forEach((ind) => {
      const val = Math.floor(Math.random() * 100) + 1; 
      const signal = val > 50 ? 'BUY' : 'SELL';
      indData[ind] = { value: val, signal };
    });

    // Još fiktivni buy/sell
    const buySig = Math.floor(Math.random() * 100) + 1;
    const sellSig = Math.floor(Math.random() * 100) + 1;

    // StopLoss / target
    const buyTarget = (currentPrice * 1.07).toFixed(2);
    const buyStopLoss = (currentPrice * 0.95).toFixed(2);
    const sellTarget = (currentPrice * 0.93).toFixed(2);
    const sellStopLoss = (currentPrice * 1.05).toFixed(2);

    return {
      timeframe: tf,
      indicators: indData, // ovdje su rsi, macd, stoch, ...
      buySig,
      sellSig,
      buyTarget,
      buyStopLoss,
      sellTarget,
      sellStopLoss
    };
  });
}
