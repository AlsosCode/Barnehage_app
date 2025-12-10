# Barnehage App - Backend API

En enkel Express.js backend for en barnehage-app som håndterer barn, foreldre, aktiviteter og inn/ut-stempling.

## Teknologi

- **Backend**: Express.js
- **Database**: JSON fil (database.json)
- **Frontend**: React Native (Expo) i `my-app/` mappen

## Prosjektstruktur

```
Barnehage_app/
├── server.js              # Hovedserverfil med Express
├── database.json          # JSON-database
├── package.json
├── routes/               # API-ruter
│   ├── children.js       # Barn-relaterte ruter
│   ├── parents.js        # Foreldre-relaterte ruter
│   ├── activities.js     # Aktivitets-ruter
│   └── stats.js          # Statistikk-ruter
├── transferRoutes.js     # Transfer/overførings-ruter
├── utils/
│   └── db.js            # Database-hjelpefunksjoner
└── my-app/              # React Native frontend
```

## Start server
```bash
npm install
npm start
```

### Start frontend
```bash
cd my-app
npm install
npm start
```

Serveren kjører på `http://localhost:3002`

## Database Schema

### Children (Barn)
```json
{
  "id": 1,
  "name": "Liam Hansen",
  "birthDate": "2021-03-15",
  "age": 4,
  "group": "Blå gruppe",
  "allergies": ["Nøtter", "Egg"],
  "status": "checked_in" | "checked_out" | "home",
  "checkedInAt": "2025-12-02T08:15:00Z",
  "checkedOutAt": null,
  "parentId": 1
}
```

### Parents (Foreldre)
```json
{
  "id": 1,
  "name": "Kari Hansen",
  "email": "kari.hansen@example.com",
  "phone": "12345678",
  "address": "Storgata 1, Oslo",
  "childrenIds": [1]
}
```

### Activities (Aktiviteter)
```json
{
  "id": 1,
  "title": "Maling og kreativitet",
  "description": "I dag hadde vi en fin maletime!",
  "imageUrl": null,
  "createdAt": "2025-12-02T10:30:00Z",
  "createdBy": "staff",
  "group": "Blå gruppe"
}
```

### Groups (Grupper)
```json
{
  "id": 1,
  "name": "Blå gruppe",
  "totalCapacity": 12,
  "currentCount": 1
}
```

## API Endpoints

### Barn (Children)

#### Hent alle barn
```
GET /api/children
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Liam Hansen",
    "age": 4,
    "group": "Blå gruppe",
    "status": "checked_in",
    ...
  }
]
```

#### Hent ett barn
```
GET /api/children/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Liam Hansen",
  "age": 4,
  ...
}
```

#### Oppdater barn
```
PUT /api/children/:id
```

**Request Body:**
```json
{
  "name": "Liam Hansen",
  "allergies": ["Nøtter"]
}
```

#### Sjekk inn barn
```
POST /api/children/:id/checkin
```

**Response:**
```json
{
  "message": "Child checked in successfully",
  "child": { ... }
}
```

#### Sjekk ut barn
```
POST /api/children/:id/checkout
```

**Response:**
```json
{
  "message": "Child checked out successfully",
  "child": { ... }
}
```

### Foreldre (Parents)

#### Hent alle foreldre
```
GET /api/parents
```

#### Hent én forelder
```
GET /api/parents/:id
```

#### Oppdater forelder
```
PUT /api/parents/:id
```

**Request Body:**
```json
{
  "name": "Kari Hansen",
  "phone": "12345678",
  "email": "kari@example.com"
}
```

#### Hent alle barn for en forelder
```
GET /api/parents/:id/children
```

### Aktiviteter (Activities)

#### Hent alle aktiviteter
```
GET /api/activities
```

**Query Parameters:**
- `group`: Filtrer på gruppe (f.eks. `?group=Blå gruppe`)

#### Legg til ny aktivitet
```
POST /api/activities
```

**Request Body:**
```json
{
  "title": "Uteleker",
  "description": "Vi lekte i snøen!",
  "imageUrl": "https://...",
  "group": "Blå gruppe"
}
```

### Statistikk (Stats)

#### Hent oversikt/statistikk
```
GET /api/stats
```

**Response:**
```json
{
  "totalChildren": 3,
  "checkedIn": 1,
  "checkedOut": 1,
  "home": 1,
  "groups": [...]
}
```

#### Hent alle grupper
```
GET /api/stats/groups
```

## Eksempel på bruk

### Sjekk inn et barn
```bash
curl -X POST http://localhost:3002/api/children/1/checkin
```

### Legg til en aktivitet
```bash
curl -X POST http://localhost:3002/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tur til skogen",
    "description": "Vi hadde en flott tur i skogen i dag!",
    "group": "Blå gruppe"
  }'
```

### Oppdater foreldrekontakt
```bash
curl -X PUT http://localhost:3002/api/parents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "99887766",
    "email": "ny.email@example.com"
  }'
```

## Koble til frontend (React Native)

I React Native-appen din, bruk `fetch` eller `axios` for å kommunisere med API-et:

```javascript
// Eksempel: Hent alle barn
const fetchChildren = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/children');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching children:', error);
  }
};

// Eksempel: Sjekk inn et barn
const checkInChild = async (childId) => {
  try {
    const response = await fetch(`http://localhost:3002/api/children/${childId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error checking in child:', error);
  }
};
```

**NB:** Når du kjører på en fysisk enhet eller emulator, må du erstatte `localhost` med din maskins IP-adresse (f.eks. `http://192.168.1.100:3002`).

Se [my-app/services/api.ts](my-app/services/api.ts) for komplett API-klient implementasjon.

## Utvikling

- Databasen er en enkel JSON-fil som blir lest og skrevet til for hver operasjon
- Dette er kun for prototype/testing - i produksjon bør du bruke en ekte database (MongoDB, PostgreSQL, etc.)
- CORS er åpent for alle origins i development-modus

## Frontend (React Native)

Frontend-appen ligger i `my-app/` mappen og er bygget med Expo.

### Start frontend
```bash
cd my-app
npm install
npm start
```

### Viktige filer
- [my-app/services/api.ts](my-app/services/api.ts) - API-klient for kommunikasjon med backend
- [my-app/app/(tabs)/](my-app/app/(tabs)/) - Alle app-skjermer (checkin, checkout, identity, etc.)

## Kjente problemer

- [server.js](server.js) har duplikatkode på linje 91-103 som bør ryddes opp
- Port 3000 og 3002 brukes begge steder i koden - standardport er 3002

## Neste steg

1. Rydde opp duplikatkode i server.js
2. Implementer autentisering (login for foreldre/ansatte)
3. Legg til bildeopplasting for aktiviteter
4. Migrer til en ekte database (MongoDB/PostgreSQL)
5. Implementer sanntids-oppdateringer med WebSockets

## Lisens

MIT
