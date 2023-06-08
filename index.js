require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

//

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gttryf.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//
const dbConnect = async () => {
  try {
    client.connect();
    console.log(" Database Connected Successfully✅ ");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

//Collections
const usersCollection = client.db("craftopia").collection("usersCollection");
const classCollection = client.db("craftopia").collection("classCollection");

app.get("/", (req, res) => {
  res.send("Craftopia is Running");
});

// Save User Info In DB
app.put("/users/:email", async (req, res) => {
  const email = req.params.email;
  const user = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateUser = {
    $set: user.currentUser,
  };
  const result = await usersCollection.updateOne(filter, updateUser, options);
  res.send(result);
});

// Add Class in DB
app.post("/classes", async (req, res) => {
  const { addedClass } = req.body;
  const result = await classCollection.insertOne(addedClass);
  res.send(result);
});

// Get Classes
app.get("/classes", async (req, res) => {
  const result = await classCollection.find().toArray();
  res.send(result);
});

// Get Classes for Instructor
app.get("/classes/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { instructorEmail: email };
  const result = await classCollection.find(query).toArray();
  res.send(result);
});


app.listen(port, () => {
  console.log(`Craftopia is running on Port : ${port}`);
});
