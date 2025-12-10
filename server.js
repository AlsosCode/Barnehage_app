const express = require('express');
const bodyParser = require('body-parser');

// Import routes
const childrenRoutes = require("./routes/children");
const parentsRoutes = require("./routes/parents");
const activitiesRoutes = require("./routes/activities");
const statsRoutes = require("./routes/stats");
const transferRoutes = require("./routes/transferRoutes"); // riktig import

const app = express();
const port = process.env.PORT || 3002;

// ----------------------------------------
// CORS Middleware (fikser nettleser-blokkeringer)
// ----------------------------------------
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body-Parsing Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Barnehage API",
    version: "1.0.0",
    endpoints: {
      children: "/api/children",
      parents: "/api/parents",
      activities: "/api/activities",
      stats: "/api/stats",
      transfer: "/api/transfer"
    },
  });
});

// API Routes
app.use("/api/children", childrenRoutes);
app.use("/api/parents", parentsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api", transferRoutes); // riktig plassering

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Barnehage API server running on http://localhost:${port}`);
});

module.exports = app;

