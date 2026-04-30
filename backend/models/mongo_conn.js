const { MongoClient } = require('mongodb');
require('dotenv').config()

const client = new MongoClient(process.env.MONGO_URI);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to Atlas");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

module.exports = client;