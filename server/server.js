require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const { seedProductsIfEmpty } = require('./src/config/seedProducts');
const { seedPracticeSheetsIfEmpty } = require('./src/config/seedPracticeSheets');

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedProductsIfEmpty();
  await seedPracticeSheetsIfEmpty();
  app.listen(PORT, () => {
    console.log(`[Server] Live on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
});