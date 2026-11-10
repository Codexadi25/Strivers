require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const { seedProductsIfEmpty } = require('./src/config/seedProducts');
const { seedPracticeSheetsIfEmpty } = require('./src/config/seedPracticeSheets');

const PORT = process.env.PORT || 5000;

const startServer = () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Live on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
      const fallbackPort = PORT === 5000 ? 5050 : 5000;
      console.warn(`[Server Port Warning] Port ${PORT} busy or restricted (${err.code}), attempting fallback to ${fallbackPort}...`);
      const fallbackServer = app.listen(fallbackPort, '0.0.0.0', () => {
        console.log(`[Server] Live on fallback http://localhost:${fallbackPort} in ${process.env.NODE_ENV || 'development'} mode.`);
      });
      fallbackServer.on('error', (fallbackErr) => {
        console.error('[Server Fallback Error]', fallbackErr.message);
      });
    } else {
      console.error('[Server Error]', err.message);
    }
  });
};

connectDB().then(async () => {
  try {
    await seedProductsIfEmpty();
    await seedPracticeSheetsIfEmpty();
  } catch (seedErr) {
    console.warn('[Seed Notice]', seedErr.message);
  }

  startServer();
}).catch((err) => {
  console.warn('[Server Boot Notice]', err.message);
  startServer();
});
