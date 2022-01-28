const express = require("express");
const app = express();
// const MongoClient = require("mongodb").MongoClient;

const { MongoClient } = require("mongodb");
// Connection URI
const uri =
  "mongodb+srv://admin:admin@us-cluster.oxa8f.mongodb.net/?useUnifiedTopology=false";
// Create a new MongoClient
const client = new MongoClient(uri);
async function run() {
    console.log("trying");
  try {
    // Connect the client to the server
    await client.connect();
    console.log("client connected to server");
    await listDatabases(client);
    console.log("client connectd to database");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("client closed");
  }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function getLessons() {
    console.log("trying");
  try {
    // Connect the client to the server
    await client.connect();
    console.log("client connected to server");
    return JSON.stringify(client.db('booking_system').collection('lesson').find());
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("client closed");
  }
}

app.use(express.static('public'));

app.get("/test", function (request, response) {
    run().catch(console.dir);
    response.send("test")
});

app.get("/lessons", function (request, response) {
    response.json(getLessons());
});

app.get("/user", function (request, response) {
    response.json(user);
});

app.use(function (request, response) {
    response.status(404).send("Page not found!");
});

app.listen(process.env.PORT || 3000);