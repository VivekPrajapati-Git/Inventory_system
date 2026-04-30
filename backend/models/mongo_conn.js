const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected successfully to Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

module.exports = mongoose.connection;