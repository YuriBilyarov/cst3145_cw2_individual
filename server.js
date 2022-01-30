const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
// Connection URI
const uri =
  "mongodb+srv://admin:admin@us-cluster.oxa8f.mongodb.net/";

app.use(express.static('public'));

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = collectionName;
    return next()
});

app.param('searchTerm', (req, res, next, searchTerm) => {
    req.searchTerm = searchTerm;
    return next()
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/lesson')
});

app.get("/collection/:collectionName", function (request, response) {
    response.json(getLessons('', request.collection));
});

app.get("/collection/:collectionName/:searchTerm", function (request, response) {
    response.json(getLessons(request.searchTerm, request.collection));
});

// should be app.post
app.get("/post", function (request, response) {
    response.json(addOrder());
});

// should be app.put
app.get("/put", function (request, response) {
    response.json(updateOrder());
});

app.use(function (request, response) {
    response.status(404).send("Page not found!");
});

app.listen(process.env.PORT || 3000);

async function connectToCluster() {
    let mongoClient;
    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
 }

 async function openCollection(mongoCluster, collectionName){
     let mongoCollection;
     try{
        const mongoDatabase = mongoCluster.db('booking_system');
        console.log("Connected to database: booking_system");
        mongoCollection = mongoDatabase.collection(collectionName);
        console.log("Connected to collection: " + collectionName);
        return mongoCollection;
     } catch (error) {
         console.error('Unable to open collection: ' + collectionName);
         process.exit();
     }
 }

async function getLessons(searchTerm, collectionName) {
    let mongoCluster
    try {
        mongoCluster = await connectToCluster();
        mongoCollection = await openCollection(mongoCluster, collectionName);
        console.log(await findLessonByName(mongoCollection, searchTerm));  
    } finally {
        await mongoCluster.close();
        console.log("Cluster connection closed");
    }
}

async function findLessonByName(collection, name) {
    if(name != ""){
        return collection.find( {topic:name} ).toArray();
    }
    return collection.find().toArray();
}

async function addOrder() {
  let mongoCluster;
    try {
        mongoCluster = await connectToCluster();
        mongoCollection = await openCollection(mongoCluster, 'order');
        console.log(await addNewOrder(mongoCollection, ""));  
    } finally {
        await mongoCluster.close();
        console.log("Cluster connection closed");
    }
}

async function addNewOrder(collection, content) {
    const documentToAdd = {
        name: 'Jim Barn',
        phone_number: "7939575331",
        lesson_id: "1002",
        space: "2"
    }
    return collection.insertOne(documentToAdd);
}

async function updateOrder() {
    let mongoCluster;
      try {
          mongoCluster = await connectToCluster();
          mongoCollection = await openCollection(mongoCluster, 'order');
          console.log(await updateOrderName(mongoCollection, "1002", ""));  
      } finally {
          await mongoCluster.close();
          console.log("Cluster connection closed");
      }
  }

async function updateOrderName(collection, lesson_id, content){
    return collection.updateOne(
       { lesson_id },
       { $set: {space:102}}
   );
}

