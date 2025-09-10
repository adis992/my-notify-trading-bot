# 🚀 Crypto Trading Bot - Real-Time Market Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen.svg)](https://adis992.github.io/my-notify-trading-bot/)

A professional cryptocurrency trading bot with real-time market data analysis, technical indicators, and comprehensive trading insights. Built with React frontend and Node.js backend, featuring live Binance API integration.

## 🌟 Features

### Real-Time Market Data
- **Live Price Tracking**: Real-time cryptocurrency prices from Binance API
- **Technical Indicators**: RSI, MACD, and custom trading signals
- **Market Analysis**: 24h price changes, volume analysis, and trend detection
- **Multi-Timeframe Support**: 1m, 5m, 15m, 1h, 4h, 1d timeframes

### Advanced Trading Interface
- **Interactive Dashboard**: Clean, responsive design with real-time updates
- **Connection Status**: Live backend connectivity monitoring
- **Trade History**: Comprehensive logging of all trading activities
- **Profit Tracking**: Real-time P&L calculations and performance metrics

### Technical Architecture
- **Microservices Design**: Separate frontend and backend services
- **Auto-Retry Logic**: Robust connection handling with exponential backoff
- **Cold Start Optimization**: Smart handling of serverless backend hibernation
- **Responsive UI**: Mobile-friendly interface with adaptive layouts

## 🔧 Tech Stack

**Frontend:**
- React 18+ with Hooks
- Axios for API communication
- CSS3 with responsive design
- GitHub Pages hosting

**Backend:**
- Node.js with Express
- Binance API integration
- Technical indicators library
- CORS configuration
- Render.com hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/adis992/my-notify-trading-bot.git
   cd my-notify-trading-bot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend will run on `http://localhost:4000`

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on `http://localhost:3000`

### Production Deployment

**Frontend (GitHub Pages):**
```bash
cd frontend
npm run build
npm run deploy
```

**Backend (Render.com):**
- Connect your GitHub repository to Render
- Deploy from `backend` directory
- Set build command: `npm install`
- Set start command: `npm start`

## 📱 Live Demo

**🌐 Web Application:** [https://adis992.github.io/my-notify-trading-bot/](https://adis992.github.io/my-notify-trading-bot/)

**🔗 API Backend:** [https://my-notify-trading-bot.onrender.com/](https://my-notify-trading-bot.onrender.com/)

### First-Time Access
> ⚠️ **Important**: The backend uses Render's free tier, which hibernates after 15 minutes of inactivity. The first request may take 30-60 seconds to wake up the server. Subsequent requests will be instant.

## 📊 API Endpoints

### Market Data
- `GET /api/market-data` - Real-time cryptocurrency prices and indicators
- `GET /api/trade-history` - Historical trade data and analysis
- `GET /api/profit-summary` - P&L calculations and performance metrics
- `GET /health` - Backend health check and status

### Response Format
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "price": "43250.50",
    "change24h": "2.45",
    "volume": "1,234,567",
    "rsi": 65.2,
    "macd": {
      "macd": 123.45,
      "signal": 98.76,
      "histogram": 24.69
    }
  },
  "timestamp": "2025-09-10T12:00:00Z"
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=4000
NODE_ENV=production
BINANCE_API_URL=https://api.binance.com
```

**Frontend (package.json):**
```json
{
  "homepage": "https://adis992.github.io/my-notify-trading-bot"
}
```

## 🛠️ Development

### Project Structure
```
my-notify-trading-bot/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── styles/          # CSS styles
│   ├── public/              # Static assets
│   └── build/               # Production build
├── backend/                 # Node.js backend API
│   ├── server.js           # Express server
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

### Key Components
- **BotTable.js**: Main trading interface with real-time data
- **api.js**: API service with retry logic and error handling
- **server.js**: Express backend with Binance API integration

## 🔒 Security & Limitations

### Security Features
- ✅ Read-only Binance API access (no trading keys required)
- ✅ CORS protection configured
- ✅ No sensitive data storage
- ✅ Public API endpoints only

### Current Limitations
- 📊 **Demo Mode**: Currently displays real market data without actual trading
- ⏱️ **Rate Limits**: Binance API rate limiting applies
- 🆓 **Free Hosting**: Backend may experience cold starts on Render free tier
- � **Mobile**: Optimized for desktop, mobile experience may vary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**"Cannot connect to trading backend"**
- Backend is waking up from hibernation (wait 30-60 seconds)
- Check if backend URL is accessible: https://my-notify-trading-bot.onrender.com/health

**Slow initial loading**
- First request to Render free tier takes time
- Use the refresh button to retry connection

**Data not updating**
- Check browser console for API errors
- Verify network connectivity
- Backend may be under heavy load

### Contact
- 📧 **Issues**: [GitHub Issues](https://github.com/adis992/my-notify-trading-bot/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/adis992/my-notify-trading-bot/discussions)

---

**⚡ Built with passion for crypto trading and modern web technologies**
