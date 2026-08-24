# Nogometna aplikacija

Ovo je web aplikacija za praćenje nogometnih natjecanja, utakmica i njihovih detalja. Korisniku omogućuje pregled dostupnih liga i sezona, rasporeda utakmica, rezultata, detalja pojedinih utakmica te praćenje utakmica koje su trenutno u tijeku.

Podaci o nogometnim natjecanjima i utakmicama dohvaćaju se putem API-Football servisa, dok se podaci potrebni za rad aplikacije pohranjuju u PostgreSQL bazu podataka.

Aplikacija je podijeljena na frontend i backend dio. Frontend je napravljen u Angularu, dok backend koristi Node.js i Express. Za prikaz promjena rezultata utakmica u stvarnom vremenu koristi se Server-Sent Events (SSE), a Match Worker periodički dohvaća podatke o utakmicama koje su trenutno u tijeku i ažurira podatke u bazi.

## Glavne mogućnosti

- pregled dostupnih nogometnih liga
- pregled sezona pojedine lige
- pregled utakmica i njihovih rezultata
- pregled detalja pojedine utakmice
- prikaz sastava i događaja na utakmici
- prikaz utakmica koje su trenutno u tijeku
- ažuriranje rezultata utakmica uživo
- sinkronizacija podataka s API-Football servisom
- pohrana podataka u PostgreSQL bazu podataka
- korištenje SSE-a za slanje promjena prema frontend dijelu aplikacije

## Korištene tehnologije

- Angular i TypeScript
- Bootstrap i SCSS
- Node.js i Express
- PostgreSQL
- API-Football
- Server-Sent Events (SSE)
- npm
- Vite

## Organizacija projekta

Projekt je podijeljen na dvije glavne cjeline:

```text
nogometna-app/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── db/
│       ├── lib/
│       ├── routes/
│       ├── services/
│       └── workers/
│
└── frontend/
    └── src/
        └── app/
            ├── pages/
            └── services/
```

Backend sadrži REST API, rad s bazom podataka, dohvaćanje podataka s API-Football servisa, sinkronizaciju utakmica i Match Worker za praćenje utakmica uživo.

Frontend sadrži korisničko sučelje aplikacije i stranice za pregled liga, utakmica, rezultata uživo i detalja utakmica.

## Pokretanje aplikacije

Za pokretanje aplikacije potrebno je imati instaliran Node.js 20 ili noviji te PostgreSQL.

Nakon kloniranja repozitorija treba otvoriti mapu projekta:

```cmd
cd nogometna-app
```

## Korištenje aplikacije

Nakon pokretanja backenda i frontenda, aplikacija se otvara u web pregledniku. Na početnoj stranici korisniku se prikazuju dostupna nogometna natjecanja.

Odabirom željene lige korisnik može pregledati dostupne sezone te odabrati sezonu za koju želi pregledati utakmice. Nakon odabira sezone prikazuje se raspored utakmica i njihovi rezultati.

Odabirom pojedine utakmice korisnik može otvoriti stranicu s detaljima utakmice, na kojoj su dostupni podaci o momčadima, rezultatu, sastavima i događajima na utakmici.

Za pregled utakmica koje su trenutno u tijeku korisnik na početnoj stranici odabire opciju **„Live matches“**. Na toj stranici prikazuju se utakmice koje su trenutno u tijeku, a njihovi rezultati i statusi automatski se ažuriraju tijekom utakmice bez potrebe za ručnim osvježavanjem stranice.


### Backend

Treba otvoriti backend mapu:

```cmd
cd backend
```

Zatim treba instalirati potrebne pakete:

```cmd
npm install
```

U mapi `backend` u `.env` datoteci potrebno je upisati podatke potrebne za spajanje na PostgreSQL bazu te API ključ za API-Football.

Primjer konfiguracije:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=naziv_baze
DB_USER=postgres
DB_PASSWORD=vasa_lozinka

API_KEY=vas_api_football_kljuc
```

Nazivi varijabli u `.env` datoteci trebaju odgovarati varijablama koje koristi backend aplikacije.

Backend se može pokrenuti naredbom:

```cmd
npm run dev
```

Backend API dostupan je na:

```text
http://localhost:3000
```

### Frontend

U novom terminalu treba otvoriti frontend mapu:

```cmd
cd frontend
```

Instalacija paketa:

```cmd
npm install
```

Frontend se pokreće naredbom:

```cmd
npm start
```

Aplikacija je nakon pokretanja dostupna na:

```text
http://localhost:4200
```

## PostgreSQL baza

Aplikacija koristi PostgreSQL za pohranu podataka o ligama, sezonama, utakmicama, događajima i sastavima.

Prije pokretanja backenda potrebno je imati pokrenut PostgreSQL server i bazu podataka navedenu u `.env` datoteci.

Za upravljanje bazom može se koristiti pgAdmin 4.

## API-Football

Za dohvaćanje nogometnih podataka koristi se API-Football servis.

API ključ potrebno je spremiti u backend `.env` datoteku. Ključ se ne smije javno objavljivati niti spremati izravno u izvorni kod.

Aplikacija koristi API za dohvaćanje podataka o ligama, sezonama, utakmicama, rezultatima, događajima i sastavima.

Kod korištenja besplatnog API-Football plana postoje ograničenja broja dnevnih zahtjeva i dostupnih sezona. Zbog toga se koristi pro API-Football plan i aplikacija podatke sprema u PostgreSQL bazu i koristi bazu za prikaz već dohvaćenih podataka, čime se smanjuje potreba za nepotrebnim pozivima prema vanjskom API-ju.

## Utakmice uživo

Za praćenje utakmica koje su trenutno u tijeku koristi se `Match Worker`.

Worker periodički provjerava podatke o utakmicama koje se igraju te ažurira njihove rezultate i statuse u bazi podataka.

Frontend se za promjene može povezati s backendom putem Server-Sent Events (SSE), čime se korisniku omogućuje prikaz promjena bez potrebe za ručnim osvježavanjem stranice.

## Provjera rada

Nakon pokretanja backenda i frontenda može se provjeriti:

- prikazuju li se dostupne lige
- mogu li se otvoriti sezone pojedine lige
- prikazuju li se utakmice i njihovi rezultati
- mogu li se otvoriti detalji utakmice
- prikazuju li se utakmice uživo
- ažuriraju li se podaci o utakmicama koje su trenutno u tijeku

Za provjeru backend API-ja mogu se koristiti preglednik, Postman ili drugi alat za slanje HTTP zahtjeva.

