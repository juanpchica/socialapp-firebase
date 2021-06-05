const functions = require("firebase-functions");
const app = require("express")();

require("dotenv").config();

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
} = require("./handlers/screams");
const {
  login,
  signup,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");
const { FBAuth } = require("./util/fbAuth");

// Screams routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
// TODO: delete scream
app.get("/scream/:screamId/like", FBAuth, likeScream);
// TODO: unlike scream
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

//Users Routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

//Join firebase with express routes
exports.api = functions.https.onRequest(app);
