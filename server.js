const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const { MongoClient } = require("mongodb");
// Connection URI
const uri =
  "mongodb+srv://admin:admin@us-cluster.oxa8f.mongodb.net/";

// app.use(express.static('public'));

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = collectionName;
    return next()
});

app.param('id', (req, res, next, id) => {
    req.lessonId = id;
    return next()
});

app.param('searchTerm', (req, res, next, searchTerm) => {
    req.searchTerm = searchTerm;
    return next()
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/lesson')
});

//GET all lessons
app.get("/collection/:collectionName", async (request, response) => {
    response.json(await getLessons('', request.collection));
});

//GET lessons that match a search term
app.get("/collection/:collectionName/:searchTerm", async (request, response) => {
    response.json(await getLessons(request.searchTerm, request.collection));
});

//POST(Create) a new order
app.post("/collection/:collectionName", async (request, response) => {
    try{
        response.json(await addOrder(request.body));
    } catch (error) {
        console.error(error);
    }
});

//PUT(Update) existing lesson available spaces
app.put("/collection/:collectionName/:id", async (request, response) => {
    try{
        response.json(await updateLesson(request.lessonId, request.body));
    } catch (error) {
        console.error(error);
    }
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
        let mongoCollection = await openCollection(mongoCluster, collectionName);
        
        let jsonResponse = await findLessonByName(mongoCollection, searchTerm);
        console.log(jsonResponse);
        return jsonResponse;
    } finally {
        await mongoCluster.close();
        console.log("Cluster connection closed");
    }
}

async function findLessonByName(collection, name) {
    if(name != ""){
        let regex = new RegExp(name, "i");
        let topicSearch = await collection.find({topic: {$regex:regex}}).toArray(); 
        if(topicSearch.length === 0){
            let locationSearch = await collection.find({location: {$regex:regex}}).toArray();
            return locationSearch;
        } else {
            return topicSearch;
        }
        // can also sort here
    }
    return await collection.find().toArray();
}

async function addOrder(orderContent) {
  let mongoCluster;
    try {
        mongoCluster = await connectToCluster();
        mongoCollection = await openCollection(mongoCluster, 'order');
        return await addNewOrder(mongoCollection, orderContent);  
    } finally {
        await mongoCluster.close();
        console.log("Cluster connection closed");
    }
}

async function addNewOrder(collection, content) {
    return await collection.insertOne(content);
}

async function updateLesson(lessonId, contentToUpdate) {
    let mongoCluster;
      try {
          mongoCluster = await connectToCluster();
          mongoCollection = await openCollection(mongoCluster, 'lesson');
          return await updateLessonSpaces(mongoCollection, lessonId, contentToUpdate);  
      } finally {
          await mongoCluster.close();
          console.log("Cluster connection closed");
      }
  }

async function updateLessonSpaces(collection, id, contentToUpdate){
    return await collection.updateOne(
       { id },
       { $set: contentToUpdate}
   );
}

