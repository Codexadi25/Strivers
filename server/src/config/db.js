const mongoose = require('mongoose');

// Disable query buffering globally so the server never hangs when DB is offline
mongoose.set('bufferCommands', false);

const FALLBACK_DIRECT_URI = 'mongodb://server:N0hC41Gka9vDCtD2@ac-xwqk5zk-shard-00-00.bm9wmnx.mongodb.net:27017,ac-xwqk5zk-shard-00-01.bm9wmnx.mongodb.net:27017,ac-xwqk5zk-shard-00-02.bm9wmnx.mongodb.net:27017/strivers?ssl=true&replicaSet=atlas-rwrh8u-shard-0&authSource=admin';

// Optimized connection options for Vercel serverless functions (cuts memory and CPU handshakes)
const SERVERLESS_MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 4000,
  maxPoolSize: 5,        // Lean pool prevents exhausting MongoDB Atlas connections and RAM
  minPoolSize: 1,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 4000,
};

let connectPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoose.connection.readyState === 2 && connectPromise) {
    return connectPromise;
  }

  const uri = process.env.MONGO_URI || FALLBACK_DIRECT_URI;

  connectPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, SERVERLESS_MONGO_OPTIONS);
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[Database Warning] Primary connection failed: ${error.message}`);

      // If SRV or primary failed, try direct replicaSet connection string
      if (uri !== FALLBACK_DIRECT_URI) {
        try {
          console.log('[Database] Attempting fallback to direct Atlas replicaSet...');
          const directConn = await mongoose.connect(FALLBACK_DIRECT_URI, SERVERLESS_MONGO_OPTIONS);
          console.log(`[Database] Connected to Atlas direct fallback: ${directConn.connection.host}`);
          return directConn;
        } catch (directErr) {
          console.warn(`[Database] Atlas direct fallback failed: ${directErr.message}`);
        }
      }

      // If Atlas failed (e.g. querySrv or network timeout), try local MongoDB fallback
      if (uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net')) {
        try {
          console.log('[Database] Attempting fallback to local MongoDB: mongodb://127.0.0.1:27017/strivers');
          const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/strivers', {
            serverSelectionTimeoutMS: 2000,
            maxPoolSize: 2,
          });
          console.log(`[Database] Connected to local MongoDB fallback: ${localConn.connection.host}`);
          return localConn;
        } catch (localErr) {
          console.warn(`[Database] Local fallback unavailable: ${localErr.message}`);
        }
      }

      // Do NOT exit process so server remains alive in dev / serverless mode
      console.warn('[Database] Continuing in offline/mock data mode without crashing the server.');
      return null;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
};

module.exports = connectDB;
