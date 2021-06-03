const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const app = require("express")();

const firebaseConfig = {
  apiKey: "AIzaSyDsCT6n76Ds1h_NAF_Ye9CwMw7fuccT1oQ",
  authDomain: "socialape-76629.firebaseapp.com",
  projectId: "socialape-76629",
  storageBucket: "socialape-76629.appspot.com",
  messagingSenderId: "685928091048",
  appId: "1:685928091048:web:89c4092625b9d3ceed619d",
};
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

// Add a new scream
app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: `Something went wrong` });
      console.error(err);
    });
});

//Join firebase with express routes
exports.api = functions.https.onRequest(app);
