require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initSchema } = require('./db');
const { seed } = require('./seed');
const { seedRepairCosts } = require('./seedCosts');
const { seedPricingEngine } = require('./seedPricingEngine');
const authRoutes = require('./routes/auth').router;
const repairRoutes = require('./routes/repair');
const adminRoutes = require('./routes/admin');
const adminPricingRoutes = require('./routes/adminPricing');
const knowledgeRoutes = require('./routes/knowledge');
const deviceRoutes = require('./routes/devices');
const costsRoutes = require('./routes/costs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded device images
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'RepairSathi AI API Engine',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/repair', repairRoutes);
app.use('/api/admin/costs', adminPricingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/costs', costsRoutes);
app.use('/api', knowledgeRoutes);

// In production, serve the client dist folder
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start Server
async function startServer() {
  try {
    await initSchema();
    await seed();
    await seedRepairCosts();
    await seedPricingEngine();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🛠️ RepairSathi AI Server running on http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
