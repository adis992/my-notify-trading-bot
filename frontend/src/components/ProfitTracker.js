import React, { useState, useEffect } from 'react';

function ProfitTracker({ marketData }) {
  // Čuvamo info o otvorenoj poziciji, npr. { type: 'BUY', entry: 230.15 }
  const [position, setPosition] = useState(null);
  // Ukupan profit (od početka dana, recimo) – resetiraš ga kad hoćeš
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (!marketData || marketData.length === 0) return;

    // Primjer: koristimo prvu stavku iz marketData
    // (ili odaberi najniži timeframe, kako želiš – ovo je samo DEMO)
    const firstTF = marketData[0];
    const signal = firstTF.finalSignal;     // 'BUY' / 'SELL' / 'NEUTRAL'
    const currentPrice = parseFloat(firstTF.price);

    // Ako još NEMA pozicije, a signal postane BUY => otvaramo "papirnatu" poziciju
    if (!position && signal === 'BUY') {
      setPosition({
        type: 'BUY',
        entry: currentPrice
      });
    }
    // Ako već imamo BUY, a pojavi se SELL => zatvaramo poziciju i zbrajamo profit
    else if (position && position.type === 'BUY' && signal === 'SELL') {
      const tradeProfit = currentPrice - position.entry; // razlika
      setProfit(prev => prev + tradeProfit);
      setPosition(null); // izlazimo iz pozicije
    }
    // Inače ne radimo ništa (NEUTRAL signal ne zatvara ako je BUY – prilagodi logiku ako želiš)
    
  }, [marketData, position]);

  return (
    <div style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>
      <h3>Daily Profit: {profit.toFixed(2)} USDT</h3>
      {position ? (
        <p>Open {position.type} @ {position.entry.toFixed(2)}</p>
      ) : (
        <p>No open position</p>
      )}
    </div>
  );
}

export default ProfitTracker;
