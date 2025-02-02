import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BotTable() {
  const [activeTab, setActiveTab] = useState('market');
  const [marketData, setMarketData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(
    localStorage.getItem('selectedCoin') || 'solana'
  );

  const coins = [
    'bitcoin','ethereum','solana','cardano','dogecoin',
    'xrp','litecoin','polkadot','chainlink','avalanche'
  ];

  useEffect(()=>{
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return ()=> clearInterval(interval);
  },[selectedCoin]);

  const fetchAll= async()=>{
    try{
      const r1 = await axios.get(`http://localhost:4000/api/getAllIndicators?coin=${selectedCoin}`);
      if(r1.data.success){
        setMarketData(r1.data.data||[]);
      }
      const r2= await axios.get('http://localhost:4000/api/logs');
      if(r2.data.success){
        setLogs(r2.data.logs||[]);
      }
      const r3= await axios.get('http://localhost:4000/api/tradeHistory');
      if(r3.data.success){
        setTradeHistory(r3.data.trades||[]);
      }
    }catch(err){
      console.error(err);
    }
  };

  const handleCoinChange=(e)=>{
    setSelectedCoin(e.target.value);
    localStorage.setItem('selectedCoin', e.target.value);
  };

  // RAST/PAD
  let totalRast=0, totalPad=0;
  marketData.forEach(md=>{
    if(md.expectedMoveUp && md.expectedMoveUp!=='-'){
      totalRast += parseFloat(md.expectedMoveUp);
    }
    if(md.expectedMoveDown && md.expectedMoveDown!=='-'){
      totalPad += parseFloat(md.expectedMoveDown);
    }
  });

  // Prosječni PREDICT
  let sumPred=0, cPred=0, sumPrice=0, cPrice=0;
  marketData.forEach(md=>{
    if(md.predictedPrice && md.predictedPrice>0){
      sumPred += md.predictedPrice; cPred++;
    }
    if(md.price && md.price>0){
      sumPrice += md.price; cPrice++;
    }
  });
  const avgPredict= cPred>0? (sumPred/cPred).toFixed(2) : '-';
  const avgPrice= cPrice>0? (sumPrice/cPrice).toFixed(2) : '-';

  let overallPredColor='#e74c3c'; // crvenkasta
  if(avgPredict!=='-' && avgPrice!=='-' && parseFloat(avgPredict)>parseFloat(avgPrice)){
    overallPredColor='#2ecc71'; // zelena
  }

  // Style
  const tabBtnStyle=(tab)=>({
    backgroundColor: activeTab===tab?'#555':'#333',
    color:'#fff',
    padding:'8px 12px',
    marginRight:'6px',
    border:'none',
    borderRadius:'4px',
    cursor:'pointer'
  });
  const rastStyle={ color:'#2ecc71', fontWeight:'bold' };
  const padStyle={ color:'#e74c3c', fontWeight:'bold' };
  const signalStyle=(sig)=>{
    if(sig.includes('SELL')){
      return { backgroundColor:'#e74c3c', color:'#000', padding:'4px 6px', borderRadius:'4px'};
    } else if(sig.includes('BUY')){
      return { backgroundColor:'#2ecc71', color:'#000', padding:'4px 6px', borderRadius:'4px'};
    } else {
      return { backgroundColor:'#f1c40f', color:'#000', padding:'4px 6px', borderRadius:'4px'};
    }
  };

  return (
    <>
      {/* Minimalan style za font i media queries */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

        body, html {
          font-family: 'Roboto', sans-serif;
          margin: 0; padding: 0;
          background-color: #000;
          color: #f0f0f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #444;
          padding: 6px;
          text-align: center;
        }

        /* Media query: ako je max širina 600px, smanji font i dovedi tablice u scroll */
        @media (max-width: 600px) {
          table {
            font-size: 0.85rem;
            display: block;
            overflow-x: auto; /* horizontal scroll */
            white-space: nowrap; 
          }
          th, td {
            padding: 4px;
          }
        }
      `}</style>

      <div style={{ width:'90%', margin:'0 auto', padding:'20px'}}>
        <h2 style={{ textAlign:'center'}}>Trade Panel</h2>

        <div style={{ textAlign:'center', marginBottom:'20px'}}>
          <button style={tabBtnStyle('market')} onClick={()=>setActiveTab('market')}>MARKET</button>
          <button style={tabBtnStyle('logs')} onClick={()=>setActiveTab('logs')}>LOGS</button>
          <button style={tabBtnStyle('history')} onClick={()=>setActiveTab('history')}>HISTORY</button>
        </div>

        {activeTab==='market' && (
          <>
            <div style={{ textAlign:'center', marginBottom:'15px'}}>
              <label style={{ marginRight:'6px'}}>Coin:</label>
              <select
                value={selectedCoin}
                onChange={handleCoinChange}
                style={{
                  background:'#333', color:'#fff', border:'1px solid #555',
                  padding:'5px 10px', borderRadius:'4px'
                }}
              >
                {coins.map((coin)=>(
                  <option key={coin} value={coin}>{coin.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* TABELA 1 */}
            <table style={{ marginBottom:'20px'}}>
              <thead style={{ background:'#3a3a3a', textTransform:'uppercase'}}>
                <tr>
                  <th>TIMEFRAME</th>
                  <th>TRENUTNA</th>
                  <th>ULAZNA</th>
                  <th>STOP LOSS</th>
                  <th>TAKE PROFIT</th>
                  <th>RAST (%)</th>
                  <th>PAD (%)</th>
                  <th>SIGNAL</th>
                </tr>
              </thead>
              <tbody>
                {marketData.length>0? (
                  marketData.map((item,i)=>(
                    <tr key={i}>
                      <td>{item.timeframe}</td>
                      <td>{item.price}</td>
                      <td>{item.entryPrice}</td>
                      <td>{item.stopLoss}</td>
                      <td>{item.takeProfit}</td>
                      <td style={rastStyle}>
                        {item.expectedMoveUp!=='-'? item.expectedMoveUp+'%' : '-'}
                      </td>
                      <td style={padStyle}>
                        {item.expectedMoveDown!=='-'? item.expectedMoveDown+'%' : '-'}
                      </td>
                      <td>
                        <span style={signalStyle(item.finalSignal)}>
                          {item.finalSignal}
                        </span>
                      </td>
                    </tr>
                  ))
                ):(
                  <tr>
                    <td colSpan={8}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* TABELA 2 */}
            <table>
              <thead style={{ background:'#3a3a3a', textTransform:'uppercase'}}>
                <tr>
                  <th>TIMEFRAME</th>
                  <th>BUY %</th>
                  <th>SELL %</th>
                  <th>RSI</th>
                  <th>MACD</th>
                  <th>SIGNAL</th>
                  <th>HISTO</th>
                  <th>PREDICT</th>
                  <th>TF CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {marketData.length>0? (
                  marketData.map((item,i)=>{
                    // predikcija boja
                    let predColor='#e74c3c';
                    if(item.predictedPrice> item.price){
                      predColor='#2ecc71';
                    }
                    // TF change boja
                    let tfColor='#e74c3c';
                    if(item.timeframeChange){
                      const tfVal = parseFloat(item.timeframeChange.replace('%',''));
                      if(tfVal>0) tfColor='#2ecc71';
                    }
                    return (
                      <tr key={i}>
                        <td>{item.timeframe}</td>
                        <td style={rastStyle}>{item.buyConfidence}</td>
                        <td style={padStyle}>{item.sellConfidence}</td>
                        <td>{item.rsi.toFixed(2)}</td>
                        <td>{item.macd.MACD.toFixed(2)}</td>
                        <td>{item.macd.signal.toFixed(2)}</td>
                        <td>{item.macd.histogram.toFixed(2)}</td>
                        <td>
                          <span style={{
                            background: predColor, color:'#000',
                            padding:'4px 6px', borderRadius:'4px'
                          }}>
                            {item.predictedPrice.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ color:tfColor, fontWeight:'bold'}}>
                          {item.timeframeChange}
                        </td>
                      </tr>
                    );
                  })
                ):(
                  <tr>
                    <td colSpan={9}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* RAST/PAD & prosječni PREDICT */}
            <div style={{ marginTop:'20px', textAlign:'center'}}>
              <p><strong>Ukupni zbroj RAST(%)</strong>: {totalRast.toFixed(2)}%</p>
              <p><strong>Ukupni zbroj PAD(%)</strong>: {totalPad.toFixed(2)}%</p>
              {avgPredict!=='-' && (
                <p>
                  <strong>Ukupan (prosječni) PREDICT</strong>:
                  <span style={{
                    background: overallPredColor, color:'#000',
                    padding:'4px 6px', borderRadius:'4px', marginLeft:'5px'
                  }}>
                    {avgPredict}
                  </span>
                  {` (vs avgPrice: ${avgPrice})`}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab==='logs' && (
          <div style={{ marginTop:'20px'}}>
            <h2>Logs - Signal History</h2>
            <table>
              <thead style={{ background:'#3a3a3a'}}>
                <tr>
                  <th>Time</th>
                  <th>Coin</th>
                  <th>Timeframe</th>
                  <th>OldSignal</th>
                  <th>NewSignal</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.length>0? (
                  logs.map((lg,i)=>(
                    <tr key={i}>
                      <td>{lg.time}</td>
                      <td>{lg.coin}</td>
                      <td>{lg.timeframe}</td>
                      <td>{lg.oldSignal}</td>
                      <td>{lg.newSignal}</td>
                      <td>{lg.reason}</td>
                    </tr>
                  ))
                ):(
                  <tr>
                    <td colSpan={6}>No logs</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab==='history' && (
          <div style={{ marginTop:'20px'}}>
            <h2>Trade History</h2>
            <table>
              <thead style={{ background:'#3a3a3a'}}>
                <tr>
                  <th>Time</th>
                  <th>Coin</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.length>0? (
                  tradeHistory.map((th,i)=>(
                    <tr key={i}>
                      <td>{th.time}</td>
                      <td>{th.coin}</td>
                      <td>{th.entryPrice}</td>
                      <td>{th.exitPrice}</td>
                      <td style={{
                        color: th.profit>=0 ? '#2ecc71':'#e74c3c'
                      }}>
                        {th.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ):(
                  <tr>
                    <td colSpan={5}>No trades</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  );
}

export default BotTable;
