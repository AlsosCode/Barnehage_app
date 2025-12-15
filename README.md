# Småtroll Barnehage App – Kindergarten Management System

En fullstack barnehage‑applikasjon som demonstrerer moderne mobilutvikling med React Native/Expo i frontend og Express/Node.js i backend. Systemet støtter rollebasert tilgang (admin / forelder), innsjekk/utsjekk, aktivitetsfeed med bilder/video og enkel håndtering av barn, foreldre og grupper.

**Course:** Mobile Application Development  
**Date:** December 2025  

**Tech stack:** React Native (Expo 54) · Node.js 18+ · Express 5 · TypeScript (frontend)

---

## Quick Start

### Prerequisites

- Node.js 18+ og npm  
- Expo Go‑appen på mobilen (iOS/Android)  
- Git  

### 1. Klon repoet

```bash
git clone https://github.com/yourusername/Barnehage_app.git
cd Barnehage_app
```

### 2. Backend – installer og start server

```bash
npm install
npm run dev     # utvikling med nodemon
```

Backend kjører på `http://localhost:3002` og eksponerer `/api/*`‑endepunkter.

### 3. Frontend – installer og start Expo‑app

Åpne en ny terminal:

```bash
cd my-app
npm install
npm run dev     # eller: npm start
```

Expo dev server starter og viser en QR‑kode.

### 4. Kjør appen

- Skann QR‑koden med Expo Go (kamera på iOS, Expo Go på Android), eller  
- Bruk tastatursnarveier i Expo: `i` for iOS‑simulator, `a` for Android‑emulator.

### 5. Miljøvariabler

Frontend leser backend‑URL fra `.env` i `my-app/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3002/api
```

Sjekk at denne peker på riktig backend‑adresse (lokalt eller på nettverk).

### 6. Pålogging (mock auth)

Systemet bruker enkel, hardkodet autentisering for demonstrasjon/eksamen:

- **Admin**
  - Username: `Admin`
  - Password: `Admin`

- **Guest (Forelder)**
  - Username: `Gjest`
  - Password: `Gjest`

I en ekte produksjonsløsning bør dette byttes ut med ekte autentisering (JWT, krypterte passord osv.).

---

## Architecture Overview

### Frontend (`my-app/`)

**Teknologi**

- React Native + Expo SDK 54  
- Expo Router (filbasert navigasjon i `app/`)  
- React Context API:
  - `AuthContext` for innlogging, rolle og parentId
  - `LocaleContext` for språkvalg (`nb` / `en`)
- Tjenestelag i `services/api.ts` (typed TypeScript)  
- Utils‑moduler i `services/utils/*` for datoer, grupper, filtrering og status
- Designsystem i `constants/theme.ts` (farger, spacing osv.)

**Viktige skjermer (under `app/(tabs)/`)**

- `index.tsx` – stempling (check‑in/out)  
- `status.tsx` – administrativ oversikt med statistikk pr. gruppe  
- `activities.tsx` – aktivitetsfeed med bilder/video, filter på gruppe og dato  
- `createActivity.tsx` – “Nytt innlegg” med:
  - valg av gruppe (chips for Blå/Rød)
  - legg til/ta bilde
  - legg til/ta opp video (med poster/thumbnail)
- `createchild.tsx` / `createparent.tsx` – registrering av barn og foreldre  
- `editinfo.tsx`, `identity.tsx` – kontaktinfo og identitetsvisning

**Rollebasert UI**

- Admin:
  - Har tilgang til alle faner (status, checkin/checkout, ny aktivitet, nye barn/foreldre osv.)
- Guest/Forelder:
  - Ser kun relevante faner (stempling/oversikt, egne aktiviteter), filtrert til barnas grupper.

**Språkstøtte**

- `i18n/strings.ts` definerer tekster på norsk og engelsk.  
- `LocaleContext` gir `locale` og `t(key)` til komponenter.  
- Tab‑titler, skjemaer og flere skjermtekster er allerede knyttet til i18n; flere kan legges til etter behov.

---

### Backend (root)

**Teknologi**

- Node.js 18+  
- Express 5.1.0  
- Multer for filopplasting (bilder/video)  
- Enkel JSON‑database (`database.json`) via `utils/db.js`

**Server (`server.js`)**

- Oppsett av Express‑app, CORS og logging  
- JSON‑parsing (`express.json`)  
- Statisk serving av opplastede filer på `/uploads/*`  
- Endepunkter:
  - `GET /`, `GET /api` – API‑index
  - `GET /api/health` – health check
  - `POST /api/upload` – filopplasting brukt av frontend
  - `use /api/children` – barn
  - `use /api/parents` – foreldre
  - `use /api/activities` – aktiviteter/feed
  - `use /api/stats` – statistikk
  - `use /api` + `transferRoutes` – midlertidige hente‑tillatelser

**Ruter (`routes/`)**

- `routes/children.js`
  - Hent, opprett, oppdater barn
  - Endepunkter for `checkin` / `checkout`
  - Bruker validering fra `utils/validators.js`
- `routes/parents.js`
  - Hent, opprett, oppdater foreldre
  - Verifisering (markere forelder som verifisert)
  - Hente alle barn for en forelder
- `routes/activities.js`
  - Hent aktiviteter (med støtte for `group`, `limit`, `offset`, `date`)
  - Opprette ny aktivitet med media‑liste (`media[]`)
- `routes/stats.js`
  - Samler statistikk (antall barn inne/hjemme pr. gruppe)
- `routes/transferRoutes.js`
  - API for midlertidige hente‑autorisasjoner (overlevering av barn)

**Datalag (`utils/`)**

- `utils/db.js`
  - Leser/skriv `database.json`
  - Normaliserer gruppenavn (Blå/Rød) og status
  - Hjelpefunksjoner:
    - `getChildren`, `getChildById`, `addChild`, `updateChild`, `checkInChild`, `checkOutChild`
    - `getParents`, `getParentById`, `createParent`, `updateParent`
    - `getActivities`, `getActivitiesByGroup`, `addActivity`
    - `getGroups`, `updateGroup`, `getStats`
- `utils/dbDriver.js`
  - Velger driver basert på `DB_DRIVER`‑env:
    - `json` (default) → `utils/db.js`
    - `mongo` (planlagt) → `utils/db.mongo.js`
- `utils/db.mongo.js`
  - Placeholder for MongoDB‑implementasjon (alle funksjoner kaster “not implemented” inntil det er implementert).
- `utils/validators.js`
  - `validateActivityPayload` – sjekker tittel, beskrivelse, lengder og media‑array
  - `validateChildPayload` – sjekker påkrevde felter for barn + lengdebegrensning
  - `validateParentPayload` – sjekker navn/e‑post/telefon + lengder

---

## Security & Configuration

- **CORS:**  
  - `server.js` leser `ALLOWED_ORIGINS` (kommaseparert liste).  
  - I produksjon bør du sette denne til faktiske domener (ikke `*`).

- **Filopplasting:**  
  - `multer` begrenser filstørrelse via `MAX_UPLOAD_BYTES` (default 10 MB).  
  - Aksepterer kun MIME‑typer som starter med `image/` eller `video/`.  
  - Filnavn renses med `path.basename` og mellomrom fjernes.

- **Input‑validering:**  
  - Felles validatorer i `utils/validators.js` sørger for at tittel/navn osv. er til stede og ikke for lange.  
  - Ruter kaster konsistente 400/404/500 med tydelige feilmeldinger.

- **Auth:**  
  - Enkel, hardkodet innlogging i frontend (`AuthContext`) for å demonstrere rollebasert UI.  
  - I en ekte løsning bør auth flyttes til backend (JWT + hashed passord).

---

## Database

**Dagens løsning:** `database.json` (filbasert)

- Enkelt å bruke i utvikling og til eksamen  
- Lagring skjer via `utils/db.js` for å sikre konsistent struktur  
- Lett å inspisere manuelt for å se barn/foreldre/aktiviteter

**Kjerne‑modeller**

- **Child**
  - `id`, `name`, `birthDate`, `age`
  - `group` (Blå/Rød)
  - `allergies` (liste)
  - `status` (`checked_in` | `checked_out` | `home`)
  - `checkedInAt`, `checkedOutAt`
  - `parentId`
- **Parent**
  - `id`, `name`, `email`, `phone`, `address`
  - `verified` (bool)
  - `childrenIds` (liste med child‑id’er)
- **Activity**
  - `id`, `title`, `description`, `group`
  - `imageUrl`, `videoUrl` (legacy‑felter)
  - `media[]` – `{ type: 'image' | 'video', url, posterUrl? }`
  - `createdAt`, `createdBy`
- **Group**
  - `id`, `name` (Blå/Rød)
  - `totalCapacity`, `currentCount`

---

## Future Development Roadmap

### Phase 1 – MongoDB‑integrasjon

**Motivasjon**

- JSON/BSON‑dokumenter passer godt til eksisterende datastruktur  
- Bedre støtte for indeksering, spørringer og skalering enn ren fil‑lagring  
- Lett å modellere barn, foreldre, aktiviteter og meldinger som collections

**Plan (skissert)**

1. Opprette MongoDB‑cluster (lokalt eller Atlas).  
2. Implementere `utils/db.mongo.js` med samme interface som `utils/db.js`.  
3. Legge til migreringsscript som leser `database.json` og skriver til Mongo‑collections.  
4. Settle `DB_DRIVER=mongo` i miljøvariabler for å bytte driver uten å endre rutene.  
5. Utvide validatorer og feilhåndtering for Mongo‑spesifikke feil.

### Phase 2 – Funksjonsutvidelser

- Push‑varsler for innsjekk/utsjekk og nye aktiviteter.  
- Egen meldingsmodul mellom foreldre og ansatte (basert på eksisterende API‑mønster).  
- Mer avansert historikk og statistikk over oppmøte.  
- Videreutvikling av offline‑støtte i mobilappen.

### Phase 3 – DevOps & Deployment

- Docker‑containere for backend og (eventuelt) Expo web build.  
- CI/CD med GitHub Actions (lint, test, build, deploy).  
- Deploy til sky (f.eks. Render, Railway, Azure eller AWS).  
- Mer avansert logging og overvåkning.

---

## Project Structure (simplified)

```text
Barnehage_app/
├── server.js          # Express backend server
├── database.json      # JSON database
├── routes/            # API routes (children, parents, activities, stats, transfer)
├── utils/             # Database access, validators, driver selection
│   ├── db.js
│   ├── dbDriver.js
│   ├── db.mongo.js
│   └── validators.js
├── uploads/           # Uploaded images/videos
├── my-app/            # React Native + Expo app
│   ├── app/           # Expo Router screens (tabs, login, modal, etc.)
│   ├── components/    # Reusable UI components
│   ├── contexts/      # Auth + Locale contexts
│   ├── services/      # API client and domain utils
│   ├── constants/     # Theme, group definitions, etc.
│   └── i18n/          # nb/en translation strings
└── README.md
```

---

## Development Scripts

**Backend (root)**

```bash
npm start       # Start server (production mode)
npm run dev     # Start med nodemon (auto-reload)
```

**Frontend (`my-app/`)**

```bash
npm start       # Start Expo dev server
npm run dev     # Start Expo dev server med tømt cache
```

---

> Merk: Denne applikasjonen bruker forenklet autentisering (hardkodede brukere) for å demonstrere funksjonalitet og arkitektur i en eksamenssetting. For produksjon bør du implementere fullverdig autentisering med sikre passord, tokens og server‑side autorisasjon.

