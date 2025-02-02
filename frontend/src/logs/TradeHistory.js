import React from 'react';

function TradeHistory({ tradeHistory }) {
  return (
    <div style={{ padding: '20px', color: '#f0f0f0', textAlign: 'center' }}>
      <h2>Trade History</h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#2b2b2b',
        }}
      >
        <thead>
          <tr style={{ background: '#3a3a3a', textTransform: 'uppercase' }}>
            <th style={{ padding: 10 }}>Time</th>
            <th style={{ padding: 10 }}>Coin</th>
            <th style={{ padding: 10 }}>Entry Price</th>
            <th style={{ padding: 10 }}>Exit Price</th>
            <th style={{ padding: 10 }}>Profit</th>
          </tr>
        </thead>
        <tbody>
          {tradeHistory.length > 0 ? (
            tradeHistory.map((trade, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #444', textAlign: 'center' }}>
                <td style={{ padding: 10 }}>{trade.time}</td>
                <td style={{ padding: 10 }}>{trade.coin}</td>
                <td style={{ padding: 10 }}>{trade.entryPrice}</td>
                <td style={{ padding: 10 }}>{trade.exitPrice}</td>
                <td
                  style={{
                    padding: 10,
                    color: trade.profit >= 0 ? '#31d679' : '#e96c6c',
                  }}
                >
                  {trade.profit.toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ padding: 10, textAlign: 'center', color: '#aaa' }}>
                No trades recorded
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TradeHistory;
