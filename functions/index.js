const functions = require("firebase-functions");
const { db } = require("../../merng-server/models/Post");
const app = require("express")();

require("dotenv").config();

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
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
app.delete("/scream/:screamId", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

//Users Routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

//Join firebase with express routes
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      //Once a get the new snapshot or liked created, get the scream liked
      const screamDoc = await db
        .doc(`/screams/${snapshot.data().screamId}`)
        .get();
      if (screamDoc.exists) {
        //Create a notification in the db
        await db.doc(`/notification/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: screamDoc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: "like",
          read: false,
          screamId: screamDoc.id,
        });

        return;
      }
    } catch (error) {
      console.error(error);
      return;
    }
  });
