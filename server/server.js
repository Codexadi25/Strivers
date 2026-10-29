require('dotenv').config();
const dns = require('dns');

// Configure public DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const app = require('./src/app');
const connectDB = require('./src/config/db');

const { seedProductsIfEmpty } = require('./src/config/seedProducts');
const { seedPracticeSheetsIfEmpty } = require('./src/config/seedPracticeSheets');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  try {
    await seedProductsIfEmpty();
    await seedPracticeSheetsIfEmpty();
  } catch (seedErr) {
    console.warn('[Seed Notice]', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Live on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}).catch((err) => {
  console.warn('[Server Boot Notice]', err.message);
  app.listen(PORT, () => {
    console.log(`[Server] Live on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
});
