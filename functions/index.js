const functions = require("firebase-functions");
const admin = require("firebase-admin");

const app = require("express")();
admin.initializeApp();

require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPIDA,
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

app.get("/screams", (req, res) => {
  db.collection("screams")
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

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: `Something went wrong` });
      console.error(err);
    });
});

//SignUp route
app.post("/signup", (req, res) => {
  // Creating user before login with req data
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // TODO: Validate user data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
      } else {
        // Authenticate user with firebase
        firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
          })
          .then((idToken) => {
            token = idToken;
            const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token });
          })
          .catch((err) => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
              return res.status(500).json({ error: "Email is already in use" });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
      }
    });
});

//Join firebase with express routes
exports.api = functions.https.onRequest(app);
