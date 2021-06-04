const { db } = require("../util/admin");
const config = require("../util/config");
const { validateSignupData, validateLoginData } = require("../util/validators");

const firebase = require("firebase");
firebase.initializeApp(config);

exports.signup = (req, res) => {
  //Destructuring data form req
  const { email, password, confirmPassword, handle } = req.body;

  // Creating user before login with req data
  const newUser = { email, password, confirmPassword, handle };

  //Validating data from user sended from client
  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  //Create doc with user
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
};

exports.login = (req, res) => {
  const user = { email: req.body.email, password: req.body.password };

  //Validate user data sended from client
  const { errors, valid } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  //Login the user in firebase
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credentials, please try again" });
    });
};

exports.uploadImage = () => {};
