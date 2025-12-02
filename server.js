const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const childrenRoutes = require('./routes/children');
const parentsRoutes = require('./routes/parents');
const activitiesRoutes = require('./routes/activities');
const statsRoutes = require('./routes/stats');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors()); // Tillat alle origins (for development)
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Barnehage API',
    version: '1.0.0',
    endpoints: {
      children: '/api/children',
      parents: '/api/parents',
      activities: '/api/activities',
      stats: '/api/stats'
    }
  });
});

// API Routes
app.use('/api/children', childrenRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Barnehage API server running on http://0.0.0.0:${port}`);
  console.log(`📱 Access from your device at http://10.0.0.61:${port}`);
  console.log(`📚 Available endpoints:`);
  console.log(`   - GET    /api/children`);
  console.log(`   - GET    /api/children/:id`);
  console.log(`   - PUT    /api/children/:id`);
  console.log(`   - POST   /api/children/:id/checkin`);
  console.log(`   - POST   /api/children/:id/checkout`);
  console.log(`   - GET    /api/parents`);
  console.log(`   - GET    /api/parents/:id`);
  console.log(`   - PUT    /api/parents/:id`);
  console.log(`   - GET    /api/parents/:id/children`);
  console.log(`   - GET    /api/activities`);
  console.log(`   - POST   /api/activities`);
  console.log(`   - GET    /api/stats`);
  console.log(`   - GET    /api/stats/groups`);
});

module.exports = app;
