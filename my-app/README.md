# Barnehage app – media og aktiviteter

Denne versjonen legger til:
- Egen Aktiviteter-fane med gruppefilter (Blå/Rød) og datofilter, samt feed med bilde/video
- Opretting av aktivitet med valg av bilde eller video

## Installer avhengigheter

Kjør i prosjektmappen:

```
npx expo install expo-image-picker expo-av expo-video-thumbnails
```

Start deretter på nytt med renset cache:

```
npm run dev
```

## Opplasting av media (server)

Front-enden kan velge bilde eller video og sender URL i `imageUrl`/`videoUrl` og/eller et galleri i `media[]` når aktiviteten opprettes. For produksjon anbefales at backend gir en opplastings-URL og returnerer en offentlig URL for filen. Inntil opplasting finnes, kan lokale URI-er fungere i dev, men for stabil visning bør `http(s)`-URL-er brukes.

API-felter:
- POST /activities
   - body: `{ title, description, group?, imageUrl?, videoUrl?, media?: [{ type: 'image'|'video', url: string, posterUrl?: string }] }`

### Minimal Express-server for opplasting

Eksempel på `/upload`-endepunkt som lagrer til disk og serverer statisk (ikke egnet for produksjon uten herding og autentisering):

```ts
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
   destination: (_req, _file, cb) => cb(null, path.join(__dirname, 'uploads')),
   filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
   if (!req.file) return res.status(400).json({ error: 'No file' });
   const url = `/uploads/${req.file.filename}`;
   res.json({ url });
});

app.listen(3002, () => console.log('Server listening on http://localhost:3002'));
```

Husk å sette `EXPO_PUBLIC_API_URL=http://localhost:3002/api` i `.env` for å peke appen på serveren.

## Bruk

- Gjest/forelder: Hjem-siden har hurtigblokker (Mine barn / Hva har de gjort i dag?). Aktiviteter er også tilgjengelig i egen fane.
- Admin: Kan opprette aktivitet fra “Nytt innlegg”.

## Tips ved problemer

- Hvis du får feilmelding om manglende moduler, kjør `npx expo install` som over.
- Hvis bilder/video ikke vises, sjekk at URL-ene er offentlige (eller kjør på enheten som har tilgang til filbanen i dev).

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
