Trade Bot Panel
Ovo je React + Node.js projekt za prikaz i analizu kripto indikatora s Binance javnog API-ja.
Frontend prikazuje dvostruke tablice (Market i Indikatori) te tabove za Logs i Trade History.
Backend dohvaća podatke s Binancea i računa različite indikatore (RSI, MACD, predikciju te BUY/SELL signale).

Sadržaj
Karakteristike
Pokretanje (lokalno)
Instalacija
Pokretanje servera
Pokretanje React aplikacije
Deploy
Brisanje logova
Napomena o .env
Kontakt
Karakteristike
Backend (server.js)
Dohvaća javne klines podatke s Binancea (/api/v3/klines) za odabrane coine i timeframe-ove.
Računa RSI, MACD, BUY/SELL signale, predikciju i drži logove u memoriji.
Ograničava broj logova na 1000 zapisa (kako memorija ne bi nekontrolirano rasla).
Frontend (BotTable.js / MainPanel)
Nudi odabir coina (npr. BTC, ETH, SOL, …).
Prikazuje trenutnu cijenu, entry/stop/TP, RAST/PAD, finalni signal (BUY/SELL/NEUTRAL).
Druga tablica prikazuje postotne vrijednosti: BUY%, SELL%, RSI, MACD, histogram, predikciju i timeframe.
Tabovi:
MARKET (dvije tablice)
LOGS (povijest signala)
HISTORY (trade povijest)
Predikcija
Uvijek izračunata kao broj.
Zelena ako je iznad trenutne cijene.
Crvena ako je ispod trenutne cijene.
Responzivnost
Osnovna responzivnost uz media query (max-width: 600px) za bolje prikazivanje na mobilnim uređajima.
Tablice imaju horizontalni scroll na manjim zaslonima.
Pokretanje (lokalno)
Instalacija
Backend
bash
Kopiraj
cd backend  # (ako je backend u posebnom folderu)
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

Slobodno ih dodaj kao Issues na GitHub repozitorij.
Možeš napraviti i fork projekta, pa poslati pull request s poboljšanjima.
Sretno s razvojem i korištenjem Trade Bot Panel projekta!
Ako imaš bilo kakvih pitanja, javi se!
