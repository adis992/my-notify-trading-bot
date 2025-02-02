Trade Bot Panel
Ovo je React + Node.js projekt za prikaz i analizu kripto indikatora s Binance javnog API-ja. Frontend prikazuje dvostruke tablice (Market, indikatori) te tabove za Logs i Trade History.

Karakteristike
Backend (server.js)

Dohvaća javne klines podatke sa Binancea (/api/v3/klines) za odabrane coine i timeframe-ove.
Računa RSI, MACD, BUY/SELL signale, predikciju i drži logove u memoriji.
Ograničava broj logova na 1000 zapisa (kako memorija ne bi rasla neograničeno).
Frontend (BotTable.js / MainPanel)

Nudi odabir coina (BTC, ETH, SOL, …).
Prikazuje trenutnu cijenu, entry/stop/TP, RAST/PAD, finalni signal (BUY/SELL/NEUTRAL).
Druga tablica prikazuje BUY%, SELL%, RSI, MACD, histo, predikciju i timeframe change.
Tabovi: MARKET (dvije tablice), LOGS (povijest signala), HISTORY (trade povijest).
Predikcija

Uvijek izračunata (broj), boja zelena ako je iznad trenutne cijene, crvena ako je ispod.
Responzivnost (osnovna)

Ugrađen minimalan media query (max-width: 600px) za bolje prikazivanje na mobilnom uređaju (tablica ima horizontalni scroll).
Pokretanje (lokalno)
Instalacija
Backend:
bash
Kopiraj
Uredi
cd backend  # (ako je poseban folder)
npm install
Frontend:
bash
Kopiraj
Uredi
cd frontend  # (ako je poseban folder)
npm install
Pokreni server
bash
Kopiraj
Uredi
node server.js
Ili
bash
Kopiraj
Uredi
npm run start
… ovisno o skriptama. Sluša na localhost:4000 (prema kodu).
Pokreni React
bash
Kopiraj
Uredi
npm start
Otvori http://localhost:3000 u pregledniku (ili gdje god React sluša).
Ako je sve ispravno, React će dohvaćati podatke s Node servera i prikazivati na panelu.

Deploy
Backend: možeš deployati na Railway, Render ili sličnu uslugu.
Frontend: možeš buildati (npm run build) i objaviti na GitHub Pages, Netlify, Vercel itd.
Samo pripazi zamijeniti localhost:4000 u kodu s javnim URL-om gdje se nalazi Node server.
Brisanje logova
Ako želiš ručno brisati logove, postoji DELETE /api/logs (u server.js) koji resetira niz logsData.
Automatski se brišu najstariji logovi ako broj logova pređe 1000 (postavljeno u getAllIndicators ruti).
Napomena o .env
U ovom projektu nije potreban .env fajl, jer se koriste javni Binance endpointi bez API ključeva.
Ako budeš koristio privatne ključeve (npr. za trade naredbe), trebaš .env i gitignore kako se ključevi ne bi objavili online.
Kontakt
Ako imaš pitanja ili poboljšanja, slobodno ih dodaj u Issues na GitHubu ili u svom fork-u.