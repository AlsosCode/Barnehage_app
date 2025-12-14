# Småtroll Barnehage App - Kindergarten Management System

A full-stack kindergarten management application demonstrating modern mobile development practices, role-based access control, real-time data synchronization, and comprehensive parent-staff communication features.

**Course:** Mobile Application Development | **Date:** December 2025

![React Native](https://img.shields.io/badge/React_Native-0.76-20232A?style=flat&logo=react)
![Expo](https://img.shields.io/badge/Expo-52-000020?style=flat&logo=expo)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Expo Go app on your mobile device (iOS/Android)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Barnehage_app.git
   cd Barnehage_app
   ```

2. **Install backend dependencies and start server**
   ```bash
   npm install
   npm run dev
   ```
   Backend will run on `http://localhost:3002`

3. **Install frontend dependencies and start app** (in new terminal)
   ```bash
   cd my-app
   npm install
   npx expo start
   ```

4. **Run the app**
   - Scan QR code with Expo Go app (iOS Camera or Android Expo Go)
   - Or press `i` for iOS simulator, `a` for Android emulator

5. **Login credentials**
   - **Admin:** Username: `Admin` / Password: `Admin`
   - **Guest (Parent):** Username: `Gjest` / Password: `Gjest`

## Project Architecture

### Frontend
**Technology Stack:** React Native + Expo SDK 52
- **Framework:** Expo Router for file-based navigation
- **UI Components:** Custom theme system with consistent design tokens
- **State Management:** React Context API for authentication and user state
- **Styling:** StyleSheet with centralized theme constants (Colors, Typography, Spacing)
- **Navigation:** Tab-based navigation with role-specific routes

**Key Features:**
- Role-based UI rendering (Admin vs Guest/Parent views)
- Real-time check-in/check-out tracking
- Activity feed with parent-staff communication
- Private messaging system
- Child information management
- Parent identity verification workflow

### Backend
**Technology Stack:** Node.js + Express
- **Server:** Express 5.1.0 with CORS enabled
- **API Design:** RESTful endpoints with JSON responses
- **Middleware:** Body-parser for JSON parsing, CORS for cross-origin requests
- **Data Validation:** Input sanitization and GDPR-compliant data handling

**API Endpoints:**
- `/api/children` - Child management (CRUD operations)
- `/api/parents` - Parent management and verification
- `/api/activities` - Activity feed posts
- `/api/messages` - Parent-staff messaging
- `/api/stats` - Real-time statistics and overview

### Database
**Current:** JSON file-based storage (`database.json`)
- Lightweight and simple for development
- Synchronous read/write operations
- Direct object manipulation
- Easy to inspect and debug

**Data Models:**
- **Children:** id, name, age, group, status, timestamps
- **Parents:** id, name, email, phone, verified, childrenIds
- **Activities:** id, title, description, group, createdAt
- **Messages:** id, parentId, content, sender, timestamp, read

## Future Development Roadmap

### Phase 1: MongoDB Migration
**Why MongoDB?**
- Native JSON/BSON format aligns with current data structure
- Horizontal scalability for growing user base
- Flexible schema for evolving data models
- Rich querying capabilities with aggregation pipeline
- Built-in data validation and indexing

**Migration Plan:**
1. Set up MongoDB Atlas cluster or local MongoDB instance
2. Create Mongoose schemas matching current data models
3. Implement data migration scripts from JSON to MongoDB
4. Update API endpoints to use MongoDB queries
5. Add proper error handling and validation
6. Implement connection pooling and retry logic

### Phase 2: Enhanced Features
- Push notifications for check-in/out events
- Photo uploads for activities
- Calendar integration for events
- Multi-language support (Norwegian/English)
- Offline-first architecture with sync

### Phase 3: DevOps & Deployment
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Cloud deployment (AWS/Azure/GCP)
- Automated testing (Jest, React Native Testing Library)
- Performance monitoring and analytics

## Technical Details

### Security
- Role-based access control (RBAC)
- Input sanitization against XSS and injection attacks
- GDPR-compliant data handling
- Secure password storage (planned: bcrypt hashing)

### Code Quality
- TypeScript for type safety
- Consistent code formatting
- Component-based architecture
- Separation of concerns (API service layer)

### Observability
- Console logging for debugging
- Error boundary implementation (planned)
- Performance metrics tracking (planned)

## Project Structure

```
Barnehage_app/
├── server.js                 # Express backend server
├── database.json            # JSON file database
├── routes/                  # API route handlers
├── models/                  # Data models and schemas
├── my-app/                  # React Native frontend
│   ├── app/                 # Expo Router pages
│   │   ├── (tabs)/         # Tab-based screens
│   │   ├── login.tsx       # Login screen
│   │   └── _layout.tsx     # Root layout and auth
│   ├── components/         # Reusable components
│   ├── contexts/           # React contexts (Auth)
│   ├── services/           # API service layer
│   └── constants/          # Theme and config
└── README.md
```

## Development

### Available Scripts

**Backend:**
```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
```

**Frontend:**
```bash
npx expo start     # Start Expo dev server
npx expo start -c  # Start with cleared cache
```

### Adding New Features

1. Create API endpoint in backend (`routes/` or `server.js`)
2. Add service method in `my-app/services/api.ts`
3. Create or update screen in `my-app/app/(tabs)/`
4. Update navigation in `_layout.tsx` if needed
5. Test with both Admin and Guest roles

---

**Note:** This application uses mock authentication for demonstration purposes. In production, implement proper authentication with JWT tokens, encrypted passwords, and secure session management.
