import React from 'react';

function MarketSection({
  marketData,
  predictions,
  coins,
  selectedCoin,
  onCoinChange,
}) {
  // Primjer… recimo izračun RAST/PAD:
  let totalRast = 0;
  let totalPad = 0;
  marketData.forEach((md) => {
    if (md.expectedMoveUp !== '-') {
      totalRast += parseFloat(md.expectedMoveUp || 0);
    }
    if (md.expectedMoveDown !== '-') {
      totalPad += parseFloat(md.expectedMoveDown || 0);
    }
  });

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Coin: </label>
        <select
          onChange={onCoinChange}
          value={selectedCoin}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            padding: '5px 10px',
            borderRadius: 4,
            outline: 'none',
          }}
        >
          {coins.map((coin) => (
            <option key={coin} value={coin}>
              {coin.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Prva tablica */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 30,
          backgroundColor: '#2b2b2b',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr style={{ background: '#3a3a3a', textTransform: 'uppercase' }}>
            <th style={{ padding: 10 }}>TIMEFRAME</th>
            <th style={{ padding: 10 }}>TRENUTNA</th>
            <th style={{ padding: 10 }}>ULAZNA</th>
            <th style={{ padding: 10 }}>STOP LOSS</th>
            <th style={{ padding: 10 }}>TAKE PROFIT</th>
            <th style={{ padding: 10 }}>RAST (%)</th>
            <th style={{ padding: 10 }}>PAD (%)</th>
            <th style={{ padding: 10 }}>SIGNAL</th>
          </tr>
        </thead>
        <tbody>
          {marketData.length > 0 ? (
            marketData.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #444', textAlign: 'center' }}>
                <td style={{ padding: 10 }}>{item.timeframe}</td>
                <td style={{ padding: 10 }}>{item.price}</td>
                <td style={{ padding: 10 }}>{item.entryPrice}</td>
                <td style={{ padding: 10 }}>{item.stopLoss}</td>
                <td style={{ padding: 10 }}>{item.takeProfit}</td>
                <td style={{ padding: 10, color: '#31d679', fontWeight: 600 }}>
                  {item.expectedMoveUp !== '-'
                    ? item.expectedMoveUp + '%'
                    : '-'}
                </td>
                <td style={{ padding: 10, color: '#e96c6c', fontWeight: 600 }}>
                  {item.expectedMoveDown !== '-'
                    ? item.expectedMoveDown + '%'
                    : '-'}
                </td>
                <td style={{ padding: 10 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      color: '#000',
                      backgroundColor:
                        item.finalSignal.includes('SELL')
                          ? '#e96c6c'
                          : item.finalSignal.includes('BUY')
                          ? '#31d679'
                          : '#555',
                    }}
                  >
                    {item.finalSignal}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Druga tablica */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#2b2b2b',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr style={{ background: '#3a3a3a', textTransform: 'uppercase' }}>
            <th style={{ padding: 10 }}>TIMEFRAME</th>
            <th style={{ padding: 10 }}>BUY %</th>
            <th style={{ padding: 10 }}>SELL %</th>
            <th style={{ padding: 10 }}>RSI</th>
            <th style={{ padding: 10 }}>MACD</th>
            <th style={{ padding: 10 }}>SIGNAL</th>
            <th style={{ padding: 10 }}>HISTO</th>
            <th style={{ padding: 10 }}>PREDICT</th>
          </tr>
        </thead>
        <tbody>
          {marketData.length > 0 ? (
            marketData.map((item, i) => {
              const foundPred = predictions.find(
                (p) => p.timeframe === item.timeframe
              );
              const curPrice = parseFloat(item.price);
              const predPrice = foundPred
                ? parseFloat(foundPred.predictedPrice)
                : curPrice;

              return (
                <tr key={i} style={{ borderBottom: '1px solid #444', textAlign: 'center' }}>
                  <td style={{ padding: 10 }}>{item.timeframe}</td>
                  <td style={{ padding: 10, color: '#31d679', fontWeight: 600 }}>
                    {item.buyConfidence}
                  </td>
                  <td style={{ padding: 10, color: '#e96c6c', fontWeight: 600 }}>
                    {item.sellConfidence}
                  </td>
                  <td style={{ padding: 10 }}>{item.rsi}</td>
                  <td style={{ padding: 10 }}>{item.macd.MACD}</td>
                  <td style={{ padding: 10 }}>{item.macd.signal}</td>
                  <td style={{ padding: 10 }}>{item.macd.histogram}</td>
                  <td style={{ padding: 10 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '0.85rem',
                        color: '#000',
                        backgroundColor:
                          predPrice > curPrice ? '#31d679' : '#e96c6c',
                      }}
                    >
                      {foundPred ? foundPred.predictedPrice : curPrice.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8}>No data</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#ccc' }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>Ukupni zbroj RAST(%)</strong>: {totalRast.toFixed(2)}%<br />
          <strong>Ukupni zbroj PAD(%)</strong>: {totalPad.toFixed(2)}%
        </p>
        <p style={{ fontStyle: 'italic' }}>
          Ovaj panel koristi <strong>marketData</strong> iz backenda
          kako bi izračunao BUY/SELL signale i indikatore u realnom vremenu.
        </p>
      </div>
    </>
  );
}

export default MarketSection;
