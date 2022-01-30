const express = require("express");
// const cors = require("cors");
const app = express();

// app.use(express.json());
// app.use(cors());

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
    response.json(await updateLesson(request.body));
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
        // console.log(await findLessonByName(mongoCollection, searchTerm));  
        return await findLessonByName(mongoCollection, searchTerm);
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

async function addOrder(orderContent) {
  let mongoCluster;
    try {
        mongoCluster = await connectToCluster();
        mongoCollection = await openCollection(mongoCluster, 'order');
        console.log(await addNewOrder(mongoCollection, orderContent));  
    } finally {
        await mongoCluster.close();
        console.log("Cluster connection closed");
    }
}

async function addNewOrder(collection, content) {
    // const documentToAdd = {
    //     name: 'Jim Barn',
    //     phone_number: "7939575331",
    //     lesson_id: "1002",
    //     space: "2"
    // }
    console.log("JSON to Add:");
    console.log(content);
    await collection.insertOne(content);
}

async function updateLesson(contentToUpdate) {
    let mongoCluster;
      try {
          mongoCluster = await connectToCluster();
          mongoCollection = await openCollection(mongoCluster, 'lesson');
          console.log(await updateLessonSpaces(mongoCollection, req.lessonId, contentToUpdate));  
      } finally {
          await mongoCluster.close();
          console.log("Cluster connection closed");
      }
  }

async function updateLessonSpaces(collection, lesson_id, contentToUpdate){
    await collection.updateOne(
       { lesson_id },
       { $set: contentToUpdate}
   );
}

