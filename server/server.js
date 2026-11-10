require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const { seedCoursesIfEmpty } = require('./src/config/seedCourses');
const { seedPracticeSheetsIfEmpty } = require('./src/config/seedPracticeSheets');

const PORT = parseInt(process.env.PORT, 10) || 8080;

let serverInstance = null;

const startServer = () => {
  if (serverInstance) return;

  // Listen on PORT without host string to bind dual-stack IPv4 (127.0.0.1) & IPv6 (::1) on Windows
  serverInstance = app.listen(PORT, () => {
    console.log(`[Server] Live on http://localhost:${PORT} and http://127.0.0.1:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });

  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
      console.warn(`[Server Port Warning] Port ${PORT} busy or inaccessible, attempting fallback to 5000...`);
      serverInstance = app.listen(5000, () => {
        console.log(`[Server] Live on fallback http://localhost:5000 and http://127.0.0.1:5000 in ${process.env.NODE_ENV || 'development'} mode.`);
      });
    } else {
      console.error('[Server Error]', err.message);
    }
  });
};

// Start HTTP server immediately so port 8080 is available in milliseconds
startServer();

// Connect to MongoDB asynchronously in the background without blocking HTTP traffic
connectDB().then(async () => {
  try {
    await seedCoursesIfEmpty();
    await seedPracticeSheetsIfEmpty();
  } catch (seedErr) {
    console.warn('[Seed Notice]', seedErr.message);
  }
}).catch((err) => {
  console.warn('[Server Boot Notice]', err.message);
});
