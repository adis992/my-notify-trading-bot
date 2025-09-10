<<<<<<< HEAD
npm install
Frontend
bash
Kopiraj
cd frontend  # (ako je frontend u posebnom folderu)
npm install
Pokretanje servera
bash
Kopiraj
node server.js
Ili, ovisno o skriptama u package.json:

bash
Kopiraj
npm run start
Napomena: Prema zadanim postavkama, server sluša na http://localhost:4000.

Pokretanje React aplikacije
U folderu frontend:

bash
Kopiraj
npm start
Potom u pregledniku otvori http://localhost:3000 (ili drugi port, ovisno o postavkama projekta).

Ako je sve ispravno, React će dohvaćati podatke s Node servera i prikazivati ih u panelu.

Deploy
Backend: može se deployati na Railway, Render ili slične hosting platforme za Node.js aplikacije.
Frontend: nakon izrade produkcijskog builda (npm run build), može se objaviti na GitHub Pages, Netlify, Vercel itd.
Pripaziti da se zamijeni localhost:4000 s javnim URL-om Node servera gdje god se pozivaju API rute.

Brisanje logova
Ako želiš ručno obrisati logove, u server.js postoji ruta:

bash
Kopiraj
DELETE /api/logs
koja resetira niz logsData.
Automatski se brišu najstariji logovi kada broj prijeđe 1000 (implementirano u getAllIndicators ruti).

Napomena o .env
U ovom projektu nije potreban .env fajl jer se koriste javni Binance endpointi bez API ključeva.
Ako ubuduće budeš koristio privatne ključeve (npr. za pravi trading), svakako ih spremi u .env fajl i dodaj u .gitignore, kako se ključevi ne bi javno objavili.

Kontakt
Ako imaš pitanja, prijedloge ili poboljšanja:

# Trade Bot Panel

React + Node.js aplikacija za praćenje kripto tržišta i indikatora koristeći javni Binance API.

## 🚀 Live Demo

**GitHub Pages**: <https://adis992.github.io/my-notify-trading-bot>
**Backend API**: <https://my-notify-trading-bot.onrender.com>

> **REAL-TIME TRADING**: Aplikacija koristi pravi Binance API za live trading podatke. Backend je hostiran na Render-u za 24/7 dostupnost.

## 🏗️ Backend Deployment (Render)

1. Fork ovaj repo
2. Kreiraj account na [Render.com](https://render.com)
3. Novi Web Service > Connect GitHub > Odaberi svoj fork
4. Postavke:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node.js
   - **Instance Type**: Free
5. Deploy!

## 🧩 Pregled

Frontend prikazuje dvije glavne tablice (Market i Indicators) + tabove za Logs i Trade History.
Backend dohvaća klines podatke, računa indikatore (RSI, MACD), generira BUY/SELL signale i vodi memorijske logove.

## ✨ Glavne karakteristike

Backend (`backend/server.js`):

- Dohvaća /api/v3/klines (Binance)
- Računa RSI, MACD, histogram, BUY/SELL signale, predikciju
- Ograničava logove na max 1000 unosa

Frontend (`frontend/src`):

- Odabir coina i timeframe-ova
- Market tablica (trenutna cijena, entry, stop, TP, signal)
- Indicators tablica (BUY%, SELL%, RSI, MACD, histogram, predikcija)
- Tabs: MARKET | LOGS | HISTORY
- Osnovna responzivnost + horizontalni scroll na malim ekranima

## 🛠 Lokalno pokretanje

1. Backend instalacija

```bash
cd backend
npm install
npm start   # pokreće server na http://localhost:4000
```

1. Frontend instalacija

```bash
cd frontend
npm install
npm start   # pokreće React dev server (default http://localhost:3000)
```

1. Korištenje

Otvoriti browser: <http://localhost:3000> (frontend poziva backend na portu 4000).

## 🚀 Deploy

### Backend

Hostati na: Render, Railway, Fly.io, Koyeb ili Vercel Serverless (uz prilagodbu). Nakon deploya, zamijeni `http://localhost:4000` bazni URL u frontend `services/api.js` ako je drugačiji.

### Frontend (GitHub Pages)

Konfigurirano u `frontend/package.json`:

```json
"homepage": "https://adis992.github.io/my-notify-trading-bot",
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

Koraci:

```bash
cd frontend
npm install        # instalira i gh-pages (ako već nije)
npm run deploy
```

Stranica će biti dostupna na: <https://adis992.github.io/my-notify-trading-bot>

**Napomena**: GitHub Pages koristi produkcijski backend URL (Render). Za lokalni development koristi `localhost:4000`.

Ako build ne učita API podatke, provjeri CORS i BASE_URL u `services/api.js`.

## 🔧 Čišćenje logova

Manualno:

```text
DELETE /api/logs
```

Automatski se režu najstariji zapisi kada broj prijeđe 1000.

## 🔐 .env Napomena

Trenutno nije potreban `.env` (javni endpointi). Ako kasnije koristiš privatne Binance ključeve:

```env
BINANCE_API_KEY=...
BINANCE_SECRET=...
```

Nemoj ih committati – dodaj u `.gitignore`.

## 📂 Struktura projekta (skraćeno)

```text
backend/
  server.js
frontend/
  src/
    components/
    services/api.js
    logs/
```

## 🧪 Ideje za poboljšanja

- Socket stream za real-time cijene
- Persistencija logova (Mongo / Postgres)
- Autentikacija + vlastite strategije
- UI filtriranje i sortiranje tablica

## 🤝 Contributing

Fork > Branch > Commit > Pull Request.

## 📬 Kontakt

Ako imaš ideju ili bug: otvori Issue na GitHubu.

Sretno i dobar profit! 💹
