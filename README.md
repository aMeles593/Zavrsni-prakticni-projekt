# Nogometna aplikacija

Web aplikacija za praćenje nogometnih natjecanja, utakmica i njihovih detalja. Korisniku omogućuje pregled dostupnih liga i sezona, rasporeda utakmica, rezultata, detalja pojedinih utakmica te praćenje utakmica koje su trenutno u tijeku.

Podaci o nogometnim natjecanjima i utakmicama dohvaćaju se putem servisa API-Football, dok se podaci potrebni za rad aplikacije pohranjuju u PostgreSQL bazu podataka.

Aplikacija je podijeljena na frontend i backend dio. Frontend je razvijen korištenjem Angulara i TypeScripta, dok backend koristi Node.js i Express. Za prikaz promjena podataka o utakmicama u stvarnom vremenu koristi se Server-Sent Events (SSE), dok Match Worker periodički dohvaća podatke o utakmicama koje su trenutno u tijeku i ažurira ih u bazi podataka.

## Glavne mogućnosti

* pregled dostupnih nogometnih liga
* pregled sezona pojedine lige
* pregled utakmica i njihovih rezultata
* pregled detalja pojedine utakmice
* prikaz sastava i događaja na utakmici
* prikaz utakmica koje su trenutno u tijeku
* ažuriranje rezultata utakmica uživo
* sinkronizacija podataka s API-Football servisom
* pohrana podataka u PostgreSQL bazu podataka
* korištenje SSE-a za slanje promjena prema frontend dijelu aplikacije

## Korištene tehnologije

* Angular
* TypeScript
* Bootstrap
* SCSS
* Node.js
* Express.js
* PostgreSQL
* API-Football
* Server-Sent Events (SSE)
* npm

## Organizacija projekta

Projekt je podijeljen na frontend i backend dio:

```text
nogometna-app/
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── lib/
│       ├── routes/
│       ├── services/
│       └── workers/
│
├── database/
│   └── database.sql
│
└── frontend/
    └── src/
        └── app/
            ├── pages/
            └── services/
```

Backend sadrži REST API, rad s PostgreSQL bazom podataka, dohvaćanje podataka s API-Football servisa, sinkronizaciju podataka te Match Worker za praćenje utakmica uživo.

Frontend sadrži korisničko sučelje aplikacije i stranice za pregled liga, sezona, utakmica, utakmica uživo i detalja pojedinih utakmica.

Mapa `database` sadrži SQL skriptu potrebnu za kreiranje strukture PostgreSQL baze podataka.

## PostgreSQL baza

Aplikacija koristi PostgreSQL bazu podataka za trajnu pohranu podataka o ligama, sezonama, utakmicama, događajima, sastavima momčadi, igračima i njihovim statistikama.

Za rad aplikacije potrebno je imati instaliran i pokrenut PostgreSQL server.

### Kreiranje baze

U repozitoriju se nalazi SQL skripta:

```text
database/database.sql
```

Skripta sadrži strukturu baze podataka, uključujući tablice, primarne i strane ključeve, ograničenja i indekse. Skripta ne sadrži podatke iz razvojne baze.

Za kreiranje baze potrebno je:

1. Pokrenuti PostgreSQL server.
2. U PostgreSQL-u kreirati novu praznu bazu podataka, primjerice `football_app`.
3. Otvoriti `database/database.sql` u pgAdminu 4 ili drugom PostgreSQL alatu.
4. Pokrenuti SQL skriptu nad novom bazom.

Nakon izvršavanja skripte baza će sadržavati sve tablice i ostale elemente potrebne za rad aplikacije.

### Konfiguracija baze

Podaci za spajanje na PostgreSQL bazu definiraju se u `.env` datoteci unutar mape `backend`.

Primjer konfiguracije:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_app
DB_USER=postgres
DB_PASSWORD=your_password
API_KEY=your_api_football_key
```

Vrijednosti je potrebno prilagoditi lokalnoj PostgreSQL konfiguraciji i API-Football računu.

`.env` datoteka ne treba se javno objavljivati jer sadrži podatke potrebne za pristup bazi i API ključ.

## API-Football

Za dohvaćanje nogometnih podataka koristi se API-Football servis.

API ključ potrebno je spremiti u `.env` datoteku backend aplikacije. Ključ se ne smije javno objavljivati niti spremati izravno u izvorni kod.

Aplikacija koristi API-Football za dohvaćanje podataka o ligama, sezonama, utakmicama, rezultatima, događajima i sastavima.

Kod korištenja API-Football servisa postoje ograničenja broja zahtjeva i dostupnih sezona, ovisno o korištenom planu. Aplikacija zato dohvaćene podatke pohranjuje u PostgreSQL bazu i koristi ih za prikaz podataka, čime se smanjuje potreba za nepotrebnim ponovljenim pozivima prema vanjskom API-ju.

## Pokretanje aplikacije

Za pokretanje aplikacije potrebno je imati instaliran:

* Node.js 20 ili noviji
* PostgreSQL

Prije pokretanja backenda potrebno je kreirati PostgreSQL bazu prema uputama iz poglavlja **PostgreSQL baza** i konfigurirati `.env` datoteku.

Nakon kloniranja repozitorija potrebno je otvoriti mapu projekta:

```cmd
cd nogometna-app
```

### Pokretanje backenda

Otvoriti mapu `backend`:

```cmd
cd backend
```

Instalirati potrebne pakete:

```cmd
npm install
```

Nakon konfiguracije `.env` datoteke backend se pokreće naredbom:

```cmd
npm run dev
```

Backend API dostupan je na:

```text
http://localhost:3000
```

### Pokretanje frontenda

U novom terminalu otvoriti mapu `frontend`:

```cmd
cd frontend
```

Instalirati potrebne pakete:

```cmd
npm install
```

Frontend se pokreće naredbom:

```cmd
npm start
```

Nakon pokretanja aplikacija je dostupna na:

```text
http://localhost:4200
```

## Korištenje aplikacije

Nakon pokretanja backenda i frontenda aplikacija se otvara u web pregledniku.

Na početnoj stranici korisniku se prikazuju dostupna nogometna natjecanja. Odabirom željene lige korisnik može pregledati dostupne sezone te odabrati sezonu za koju želi pregledati utakmice.

Nakon odabira sezone prikazuje se raspored utakmica i njihovi rezultati. Odabirom pojedine utakmice korisnik može otvoriti stranicu s detaljima utakmice, na kojoj su dostupni podaci o momčadima, rezultatu, sastavima i događajima.

Za pregled utakmica koje su trenutno u tijeku korisnik na početnoj stranici odabire opciju **„Live matches“**. Na toj stranici prikazuju se utakmice koje su trenutno u tijeku, a njihovi rezultati i statusi automatski se ažuriraju tijekom utakmice bez potrebe za ručnim osvježavanjem stranice.

## Utakmice uživo

Za praćenje utakmica koje su trenutno u tijeku koristi se `Match Worker`.

Worker periodički provjerava podatke o utakmicama koje se trenutno igraju te ažurira njihove rezultate i statuse u PostgreSQL bazi podataka.

Frontend se putem Server-Sent Events (SSE) povezuje s backendom i prima promjene podataka, čime se omogućuje ažuriranje prikaza utakmice u stvarnom vremenu bez potrebe za ručnim osvježavanjem stranice.

## Provjera rada

Nakon pokretanja backenda i frontenda može se provjeriti:

* prikazuju li se dostupne lige
* mogu li se otvoriti sezone pojedine lige
* prikazuju li se utakmice i njihovi rezultati
* mogu li se otvoriti detalji utakmice
* prikazuju li se utakmice uživo
* ažuriraju li se podaci o utakmicama koje su trenutno u tijeku

Za provjeru backend API-ja mogu se koristiti preglednik, Postman ili drugi alat za slanje HTTP zahtjeva.
