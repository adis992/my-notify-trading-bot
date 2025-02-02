import React from 'react';

const CoinSelect = ({ selectedCoin, setSelectedCoin }) => {
    const coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin', 'xrp', 'litecoin', 'polkadot', 'chainlink', 'avalanche'];

    return (
        <div className="coin-selector">
            <label>Coin: </label>
            <select onChange={(e) => setSelectedCoin(e.target.value)} value={selectedCoin}>
                {coins.map(coin => (
                    <option key={coin} value={coin}>{coin.toUpperCase()}</option>
                ))}
            </select>
        </div>
    );
};

export default CoinSelect;
