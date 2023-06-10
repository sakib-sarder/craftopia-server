require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// verify jwt
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "Unauthrized Access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "Unauthrized Access" });
    }
    req.decoded = decoded;
    next();
  });
};

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
const selectedCollection = client
  .db("craftopia")
  .collection("selectedCollection");

app.get("/", (req, res) => {
  res.send("Craftopia is Running");
});

//Generate JWT Token
app.post("/jwt", (req, res) => {
  const email = req.body;
  const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
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

//Get single User
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const result = await usersCollection.findOne(query);
  res.send(result);
});

//Get all user
app.get("/users", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

// Get Instructors
app.get("/instructors", async (req, res) => {
  const query = { role: "Instructor" };
  const result = await usersCollection.find(query).toArray();
  // console.log(result);
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

// Get Sorted Classes
app.get("/sortedClass", async (req, res) => {
  const result = await classCollection
    .find({})
    .sort({
      enrolled: -1,
    })
    .limit(6)
    .toArray();
  res.send(result);
});

// Get Classes for Instructor
app.get("/classes/:email", async (req, res) => {
  const email = req.params.email;
  const query = { instructorEmail: email };
  const result = await classCollection.find(query).toArray();
  res.send(result);
});

// Update Classes status
app.patch("/classes/status/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  const query = { _id: new ObjectId(id) };
  const updateClass = {
    $set: {
      status: status,
    },
  };
  // console.log(updateClass);
  const result = await classCollection.updateOne(query, updateClass);
  res.send(result);
});

// update class feedback
app.patch("/classes/feedback/:id", async (req, res) => {
  const id = req.params.id;
  const feedback = req.body.feedback;
  const query = { _id: new ObjectId(id) };
  const updateClass = {
    $set: {
      feedback: feedback,
    },
  };
  // console.log(updateClass);
  const result = await classCollection.updateOne(query, updateClass);
  res.send(result);
});


// selected Class
app.post("/selectedClasses", async (req, res) => {
  const selectedClass = req.body;
  const result = await selectedCollection.insertOne(selectedClass);
  res.send(result);
});

app.get("/selectedClasses/:email", verifyJWT, async (req, res) => {
  const email = req.params.email;
  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(403).send({ error: true, message: "Forbidden Access" });
  }
  const filter = { studentEmail: email };
  const result = await selectedCollection.find(filter).toArray();
  res.send(result);
});

app.delete("/selectedClasses/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await selectedCollection.deleteOne(query);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Craftopia is running on Port : ${port}`);
});
