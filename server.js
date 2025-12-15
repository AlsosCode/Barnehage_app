const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Import routes
const childrenRoutes = require("./routes/children");
const parentsRoutes = require("./routes/parents");
const activitiesRoutes = require("./routes/activities");
const statsRoutes = require("./routes/stats");
const transferRoutes = require("./routes/transferRoutes"); // riktig import
const messagesRoutes = require("./routes/messages");

const app = express();
const port = process.env.PORT || 3002;

// ----------------------------------------
// CORS Middleware (kontroller hvilke origins som har tilgang)
// ----------------------------------------
const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.length > 0) {
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else if (!origin) {
    // Non-browser clients (curl, Node fetch without origin)
    res.header('Access-Control-Allow-Origin', '*');
  } else if (process.env.NODE_ENV !== 'production') {
    // Development fallback: allow any origin to avoid blocking local testing
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body-Parsing Middleware (erstatter body-parser)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Statisk serve av opplastede filer
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

function apiIndex(req, res) {
  res.json({
    message: "Barnehage API",
    version: "1.0.0",
    endpoints: {
      children: "/api/children",
      parents: "/api/parents",
      activities: "/api/activities",
      stats: "/api/stats",
      transfer: "/api/transfer",
      upload: "/api/upload",
      health: "/api/health",
    },
  });
}

// Root endpoint
app.get("/", apiIndex);
// Convenience endpoint (so /api i nettleser ikke gir 404)
app.get("/api", apiIndex);

// Health-check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Enkel opplasting – kompatibel med frontendens api.media.upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/\s+/g, '_');
    cb(null, `${ Date.now() }-${ safeName }`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_BYTES || '', 10) || 10 * 1024 * 1024, // 10 MB default
  },
  fileFilter: (_req, file, cb) => {
    const allowedPrefixes = ['image/', 'video/'];
    if (allowedPrefixes.some((p) => file.mimetype && file.mimetype.startsWith(p))) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.message || 'Upload failed';
      return res.status(400).json({ error: message });
    }

    if (!req.file) return res.status(400).json({ error: 'No file' });
    const relativeUrl = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
    res.json({ url: absoluteUrl });
  });
});

// API Routes
app.use("/api/children", childrenRoutes);
app.use("/api/parents", parentsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api", transferRoutes); // riktig plassering
app.use("/api/messages", messagesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server - listen on all interfaces
const server = app.listen(port, () => {
  console.log(`🚀 Barnehage API server running on http://localhost:${port}`);
  console.log(`   Also accessible at http://192.168.1.102:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
