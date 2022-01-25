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
    // Establish and verify connection
    // await client.db("admin").command({ ping: 1 });
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

// run().catch(console.dir);



// let db;
// MongoClient.connect("mongodb+srv://admin:admin@cst3145-cluster.oxa8f.mongodb.net/booking_system?retryWrites=true&w=majority", (err, client) => {
//     db = client.db("booking_system");
// });

let lessons = [
    { 'topic': 'math', 'location': 'London', 'price': 100 },
    { 'topic': 'math', 'location': 'Liverpool', 'price': 80 },
    { 'topic': 'math', 'location': 'Oxford', 'price': 90 },
    { 'topic': 'math', 'location': 'Bristol', 'price': 120 },
];

let user = { 'email': 'user@email.com', 'password': 'mypassword' };

app.use(express.static('public'));

app.get("/test", function (request, response) {
    run().catch(console.dir);
    response.send("test")
});

app.get("/lessons", function (request, response) {
    response.json(lessons);
});

app.get("/user", function (request, response) {
    response.json(user);
});

app.use(function (request, response) {
    response.status(404).send("Page not found!");
});

app.listen(process.env.PORT || 3000);