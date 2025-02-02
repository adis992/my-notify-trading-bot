// src/components/FooterTimeframes.js
import React from 'react';

function FooterTimeframes({ signalsData }) {
  if (!signalsData || signalsData.length === 0) return null;

  return (
    <div className="footer-table-container">
      <h2>RSI/MACD detaljno</h2>
      <table className="bot-table">
        <thead>
          <tr>
            <th>Timeframe</th>
            <th>Price</th>
            <th>RSI</th>
            <th>MACD</th>
            <th>Signal line</th>
            <th>Histogram</th>
            <th>Final</th>
          </tr>
        </thead>
        <tbody>
          {signalsData.map((tf, idx) => {
            let color = '#fff';
            if (tf.finalSignal === 'BUY') color = 'limegreen';
            if (tf.finalSignal === 'SELL') color = 'red';

            return (
              <tr key={idx}>
                <td>{tf.timeframe}</td>
                <td>${tf.price}</td>
                <td>{tf.rsi}</td>
                <td>{tf.macd.macd}</td>
                <td>{tf.macd.signal}</td>
                <td>{tf.macd.histogram}</td>
                <td style={{ color, fontWeight: 'bold' }}>
                  {tf.finalSignal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FooterTimeframes;
