const { MongoClient } = require("mongodb");
const express = require("express");
var cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const port = 3000;

// middleware
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.8wzbur6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = await client.db("coursekoriDB");

    //  collections
    const userCollection = await database.collection("users");
    const coursesCollection = await database.collection("courses");
    const categoriesCollection = await database.collection("category");

    // APIs
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const role = req.query.role;
      let result;
      if (role) {
        result = await userCollection.find({ role: role }).toArray();
      } else {
        result = await userCollection.find({}).toArray();
      }
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const body = req.body;
      const email = { email: body.email };

      const status = await userCollection.findOne(email);

      if (!status) {
        const result = await userCollection.insertOne({
          email: body.email,
          name: body.name,
          role: body.role,
        });
        res.send(result);
      } else {
        res.send({ status: "User data store already!" });
      }
    });

    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find({}).toArray();
      res.send(result);
    });
    app.get("/courses/:id", async (req, res) => {
      const query = { id: parseInt(req.params.id) };
      const result = await coursesCollection.findOne(query, {});
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
