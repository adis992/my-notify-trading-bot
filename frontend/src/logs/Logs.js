import React from 'react';

function Logs({ history }) {
  return (
    <div style={{ padding: '20px', color: '#f0f0f0', textAlign: 'center' }}>
      <h2>Logs - Signal History</h2>
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
            <th style={{ padding: 10 }}>Timeframe</th>
            <th style={{ padding: 10 }}>Old Signal</th>
            <th style={{ padding: 10 }}>New Signal</th>
            <th style={{ padding: 10 }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((log, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #444', textAlign: 'center' }}>
                <td style={{ padding: 10 }}>{log.time}</td>
                <td style={{ padding: 10 }}>{log.coin}</td>
                <td style={{ padding: 10 }}>{log.timeframe}</td>
                <td style={{ padding: 10 }}>{log.oldSignal}</td>
                <td style={{ padding: 10 }}>{log.newSignal}</td>
                <td style={{ padding: 10 }}>{log.reason}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: 10, textAlign: 'center', color: '#aaa' }}>
                No logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Logs;
