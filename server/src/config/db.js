const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS (Google & Cloudflare) to prevent querySrv ECONNREFUSED on Windows/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('[DNS Notice] Could not set custom DNS servers:', err.message);
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/strivers';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Warning] Primary connection failed: ${error.message}`);

    // If Atlas failed (e.g. querySrv or network timeout), try local MongoDB fallback
    if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
      try {
        console.log('[Database] Attempting fallback to local MongoDB: mongodb://127.0.0.1:27017/strivers');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/strivers', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Database] Connected to local MongoDB fallback: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.warn(`[Database] Local fallback unavailable: ${localErr.message}`);
      }
    }

    // Do NOT exit process so server remains alive in dev mode
    console.warn('[Database] Continuing in offline/mock data mode without crashing the server.');
    return null;
  }
};

module.exports = connectDB;
