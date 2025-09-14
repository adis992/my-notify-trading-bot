import React, { useState, useEffect } from 'react';

const Settings = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [maxHistoryDays, setMaxHistoryDays] = useState(7);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // API URL presets
  const apiPresets = [
    {
      name: 'CoinGecko (Default)',
      url: 'https://api.coingecko.com/api/v3',
      description: 'Free API, 100 calls/minute limit',
      requiresKey: false
    },
    {
      name: 'CoinGecko Pro',
      url: 'https://pro-api.coingecko.com/api/v3',
      description: 'Paid API, higher limits',
      requiresKey: true
    },
    {
      name: 'Coinbase Advanced',
      url: 'https://api.exchange.coinbase.com',
      description: 'Real exchange data',
      requiresKey: false
    },
    {
      name: 'Custom Backend',
      url: 'https://my-notify-trading-bot-backend.onrender.com/api',
      description: 'Your custom backend',
      requiresKey: false
    }
  ];

  useEffect(() => {
    // Load saved settings
    const savedApiUrl = localStorage.getItem('trading_api_url') || 'https://api.coingecko.com/api/v3';
    const savedApiKey = localStorage.getItem('trading_api_key') || '';
    const savedRefreshInterval = localStorage.getItem('trading_refresh_interval') || '60';
    const savedMaxHistoryDays = localStorage.getItem('trading_max_history_days') || '7';

    setApiUrl(savedApiUrl);
    setApiKey(savedApiKey);
    setRefreshInterval(parseInt(savedRefreshInterval));
    setMaxHistoryDays(parseInt(savedMaxHistoryDays));
  }, []);

  const saveSettings = () => {
    localStorage.setItem('trading_api_url', apiUrl);
    localStorage.setItem('trading_api_key', apiKey);
    localStorage.setItem('trading_refresh_interval', refreshInterval.toString());
    localStorage.setItem('trading_max_history_days', maxHistoryDays.toString());
    
    // Trigger page reload to apply new settings
    window.location.reload();
  };

  const resetToDefaults = () => {
    setApiUrl('https://api.coingecko.com/api/v3');
    setApiKey('');
    setRefreshInterval(60);
    setMaxHistoryDays(7);
  };

  const testApiConnection = async () => {
    try {
      const testUrl = apiUrl.includes('coingecko') 
        ? `${apiUrl}/ping`
        : `${apiUrl}/test`;
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      alert('✅ API connection successful!');
    } catch (error) {
      alert('❌ API connection failed: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#2a2a2a',
        border: '2px solid #555',
        borderRadius: '12px',
        padding: '25px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        color: '#fff'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #444',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#fff' }}>
            ⚙️ Trading Bot Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#e74c3c',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>

        {/* API URL Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#f39c12', marginBottom: '10px' }}>
            🌐 API Data Source
          </h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Select API Provider:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {apiPresets.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setApiUrl(preset.url)}
                  style={{
                    background: apiUrl === preset.url ? '#27ae60' : '#3a3a3a',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
                    {preset.description}
                  </div>
                  {preset.requiresKey && (
                    <div style={{ fontSize: '10px', color: '#f39c12', marginTop: '3px' }}>
                      🔑 API Key Required
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Custom API URL:
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#333',
                border: '1px solid #555',
                borderRadius: '4px',
                color: '#fff'
              }}
              placeholder="https://api.coingecko.com/api/v3"
            />
          </div>

          {(apiUrl.includes('pro-api.coingecko.com') || showAdvanced) && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                API Key (if required):
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  color: '#fff'
                }}
                placeholder="Enter your API key"
              />
            </div>
          )}

          <button
            onClick={testApiConnection}
            style={{
              background: '#3498db',
              border: 'none',
              color: '#fff',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🔍 Test Connection
          </button>
        </div>

        {/* Advanced Settings */}
        <div style={{ marginBottom: '20px' }}>
          <h3 
            style={{ color: '#f39c12', marginBottom: '10px', cursor: 'pointer' }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            🔧 Advanced Settings {showAdvanced ? '▼' : '▶'}
          </h3>
          
          {showAdvanced && (
            <div style={{ background: '#333', padding: '15px', borderRadius: '6px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Refresh Interval (seconds):
                </label>
                <input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  min="30"
                  max="300"
                  style={{
                    width: '100px',
                    padding: '5px',
                    background: '#2a2a2a',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                />
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#ccc' }}>
                  (30-300 seconds, default: 60)
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Max History Days:
                </label>
                <input
                  type="number"
                  value={maxHistoryDays}
                  onChange={(e) => setMaxHistoryDays(parseInt(e.target.value))}
                  min="1"
                  max="30"
                  style={{
                    width: '100px',
                    padding: '5px',
                    background: '#2a2a2a',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                />
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#ccc' }}>
                  (1-30 days, default: 7)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rate Limits Warning */}
        <div style={{
          background: '#f39c12',
          color: '#000',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠️ <strong>Rate Limits:</strong><br/>
          • CoinGecko Free: 100 calls/minute<br/>
          • Lower refresh interval = more API calls<br/>
          • Use Pro API for higher limits
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          borderTop: '1px solid #444',
          paddingTop: '15px'
        }}>
          <button
            onClick={resetToDefaults}
            style={{
              background: '#95a5a6',
              border: 'none',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset to Defaults
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: '#7f8c8d',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              style={{
                background: '#27ae60',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              💾 Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
