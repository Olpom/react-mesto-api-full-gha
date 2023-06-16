const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1/mestodb',
};