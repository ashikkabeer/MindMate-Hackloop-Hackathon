require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

async function connect(uri) {
    const client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
}

module.exports = connect