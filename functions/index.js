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

//Join firebase with express routes
exports.api = functions.https.onRequest(app);
