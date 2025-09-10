import React, { useEffect, useState } from 'react';
import { fetchMarketData } from './services/api';
import './BotTable.css'; // CSS u kojem ćemo doraditi tamni izgled i centriranje

function App() {
  const [marketData, setMarketData] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState('solana'); // npr. default SOLANA
  const [isLoading, setIsLoading] = useState(false);

  const coins = [
    'bitcoin',
    'ethereum',
    'solana',
    'cardano',
    'dogecoin',
    'xrp',
    'litecoin',
    'polkadot',
    'chainlink',
    'avalanche'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const rawData = await fetchMarketData(selectedCoin);
        
        if (rawData && rawData.length > 0) {
          // ...i dopunjavamo logiku za entry, SL i TP
          const processed = rawData.map((item) => {
            const price = parseFloat(item.price);
            const rsi = parseFloat(item.rsi);
            const macdHist = parseFloat(item.macd.histogram);

            let finalSignal = 'NEUTRAL';
            let entryPrice = '-';
            let stopLoss = '-';
            let takeProfit = '-';
            let expectedMoveUp = '-';
            let expectedMoveDown = '-';

            // Primjer “buy” uvjeta: RSI <40 i histogram>0
            if (rsi < 40 && macdHist > 0) {
              finalSignal = 'BUY';
              entryPrice = (price * 0.998).toFixed(2); // 0.2% ispod trenutne

              stopLoss = (parseFloat(entryPrice) * 0.98).toFixed(2); // 2% ispod
              takeProfit = (parseFloat(entryPrice) * 1.05).toFixed(2); // 5% iznad

              // Expected Move (rast)
              // npr. “expectedMoveUp” = razlika (TP - price) / price * 100
              expectedMoveUp = (
                ((parseFloat(takeProfit) - price) / price) *
                100
              ).toFixed(2);

              // “expectedMoveDown” = (SL - price)/price *100
              // (obično će biti negativno)
              expectedMoveDown = (
                ((parseFloat(stopLoss) - price) / price) *
                100
              ).toFixed(2);
            }
            // Primjer “sell” uvjeta: RSI >60 i histogram<0
            else if (rsi > 60 && macdHist < 0) {
              finalSignal = 'SELL';
              entryPrice = (price * 1.002).toFixed(2); // 0.2% iznad

              stopLoss = (parseFloat(entryPrice) * 1.02).toFixed(2); // 2% gore
              takeProfit = (parseFloat(entryPrice) * 0.95).toFixed(2); // 5% dolje

              // “expectedMoveUp” (ovdje ga možemo nazvati risk gore)
              expectedMoveUp = (
                ((parseFloat(stopLoss) - price) / price) *
                100
              ).toFixed(2);

              // “expectedMoveDown” = (TP - price)/price *100
              expectedMoveDown = (
                ((parseFloat(takeProfit) - price) / price) *
                100
              ).toFixed(2);
            }

            return {
              ...item,
              price: price.toFixed(2),
              finalSignal,
              entryPrice,
              stopLoss,
              takeProfit,
              // Ubacimo i kolone “expectedMoveUp” i “expectedMoveDown”
              expectedMoveUp,   // recimo “OČEKIVANI RAST (%)”
              expectedMoveDown  // recimo “OČEKIVANI PAD (%)”
            };
          });

          setMarketData(processed);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedCoin]);

  return (
    <div className="bot-container">
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Trade Panel</h2>
      
      {/* Demo mode banner */}
      {window.location.hostname.includes('github.io') && (
        <div style={{ 
          background: '#ff6b35', 
          color: 'white', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '5px', 
          textAlign: 'center',
          fontSize: '14px'
        }}>
          🎯 Demo mode - Showing simulated data for GitHub Pages
        </div>
      )}
      
      <div className="coin-selector">
        <label>Coin: </label>
        <select onChange={(e) => setSelectedCoin(e.target.value)} value={selectedCoin} disabled={isLoading}>
          {coins.map((coin) => (
            <option key={coin} value={coin}>
              {coin.toUpperCase()}
            </option>
          ))}
        </select>
        {isLoading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
      </div>

      {/* --- MARKET TABLE --- */}
      <table className="market-table">
        <thead>
          <tr>
            <th>TIMEFRAME</th>
            <th>TRENUTNA CIJENA</th>
            <th>ULAZNA CIJENA</th>
            <th>STOP LOSS</th>
            <th>TAKE PROFIT</th>
            <th>OČEKIVANI RAST (%)</th>
            <th>OČEKIVANI PAD (%)</th>
            <th>SIGNAL</th>
          </tr>
        </thead>
        <tbody>
          {marketData.length > 0 ? (
            marketData.map((item, i) => (
              <tr key={i}>
                <td>{item.timeframe}</td>
                <td>{item.price}</td>
                <td>{item.entryPrice}</td>
                <td>{item.stopLoss}</td>
                <td>{item.takeProfit}</td>
                <td className="buy">
                  {item.finalSignal === 'NEUTRAL' ? '-' : item.expectedMoveUp + '%'}
                </td>
                <td className="sell">
                  {item.finalSignal === 'NEUTRAL' ? '-' : item.expectedMoveDown + '%'}
                </td>
                <td
                  className={`signal ${
                    item.finalSignal === 'BUY'
                      ? 'buy'
                      : item.finalSignal === 'SELL'
                      ? 'sell'
                      : 'neutral'
                  }`}
                >
                  <span className="signal-box">{item.finalSignal}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- INDICATORS TABLE --- */}
      <table className="indicators-table">
        <thead>
          <tr>
            <th>TIMEFRAME</th>
            <th>BUY CONF.</th>
            <th>SELL CONF.</th>
            <th>RSI</th>
            <th>MACD LINE</th>
            <th>MACD SIGNAL</th>
            <th>MACD HISTO</th>
            <th>PREDICTION</th>
          </tr>
        </thead>
        <tbody>
          {marketData.length > 0 ? (
            marketData.map((item, i) => {
              // Ako u backendu već izračunavaš “prediction”, super.
              // Ako ne, možeš ovdje ubaciti logiku (kao prije).
              return (
                <tr key={i}>
                  <td>{item.timeframe}</td>
                  <td className="buy">{item.buyConfidence}</td>
                  <td className="sell">{item.sellConfidence}</td>
                  <td>{item.rsi}</td>
                  {item.macd ? (
                    <>
                      <td>{item.macd.MACD.toFixed(2)}</td>
                      <td>{item.macd.signal.toFixed(2)}</td>
                      <td>{item.macd.histogram.toFixed(2)}</td>
                    </>
                  ) : (
                    <>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </>
                  )}

                  {/* Ovdje, recimo, ako ima polje item.prediction ... */}
                  <td
                    className={`prediction-box ${
                      item.prediction && parseFloat(item.prediction) > parseFloat(item.price)
                        ? 'buy'
                        : 'sell'
                    }`}
                  >
                    {item.prediction ? item.prediction : '-'}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8">No indicator data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
