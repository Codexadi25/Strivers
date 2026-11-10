const mongoose = require('mongoose');

const FALLBACK_DIRECT_URI = 'mongodb://server:N0hC41Gka9vDCtD2@ac-xwqk5zk-shard-00-00.bm9wmnx.mongodb.net:27017,ac-xwqk5zk-shard-00-01.bm9wmnx.mongodb.net:27017,ac-xwqk5zk-shard-00-02.bm9wmnx.mongodb.net:27017/strivers?ssl=true&replicaSet=atlas-rwrh8u-shard-0&authSource=admin';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || FALLBACK_DIRECT_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Warning] Primary connection failed: ${error.message}`);

    // If SRV or primary failed, try direct replicaSet connection string
    if (uri !== FALLBACK_DIRECT_URI) {
      try {
        console.log('[Database] Attempting fallback to direct Atlas replicaSet...');
        const directConn = await mongoose.connect(FALLBACK_DIRECT_URI, {
          serverSelectionTimeoutMS: 6000,
        });
        console.log(`[Database] Connected to Atlas direct fallback: ${directConn.connection.host}`);
        return directConn;
      } catch (directErr) {
        console.warn(`[Database] Atlas direct fallback failed: ${directErr.message}`);
      }
    }
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
