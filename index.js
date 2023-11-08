require('dotenv').config();
const config = require("config");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const genres = require("./routes/genres");
const users = require("./routes/users");
const auth = require("./routes/auth");


const express = require("express");
const app = express();

if (!process.env.JWT_PRIVATE_KEY) {
  console.log("FATAL ERROR 1: jwtPrivateKey is not defined.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error(err, "Could not connect to MongoDB..."));



app.use(express.json());

app.use("/api/genres", genres);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/", (req, res) => {
  res.send('Welcome to ehb.com.co')
})

require('./startup/prod') (app);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
