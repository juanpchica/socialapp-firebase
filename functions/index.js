const functions = require("firebase-functions");
const app = require("express")();

require("dotenv").config();

const { getAllScreams, postOneScream } = require("./handlers/screams");
const { login, signup } = require("./handlers/users");
const { FBAuth } = require("./util/fbAuth");

// Screams routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);

//Users Routes
app.post("/signup", signup);
app.post("/login", login);

const isEmail = (email) => {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

//Join firebase with express routes
exports.api = functions.https.onRequest(app);
