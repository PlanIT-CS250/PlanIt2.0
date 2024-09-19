const express = require("express");
const app = express();
const PORT = 3000;

const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(express.json());

const mongoose = require("mongoose");


//Import Schema
const User = require('./schema/User');

const uri = 
  "mongodb+srv://admin:adminpassword@planit-db.80npa.mongodb.net/?retryWrites=true&w=majority&appName=planit-db";

function connect()
{
  try {
    mongoose.connect(uri);
    console.log("Connection established with MongoDB");
  } catch (error) {
    console.error(error);
  }
}

connect();
connection = mongoose.connection;

app.listen(PORT, () => {
  console.log(`Listening for requests on port ${PORT}`);
});
    
//Router for /users/...
app.use('/users', require('./users/routes'));