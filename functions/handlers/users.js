const { admin, db } = require("../util/admin");
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

exports.uploadImage = (req, res) => {
  const Busboy = require("busboy");

  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  //Get the file coming and validate it first
  const busboy = new Busboy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = { filepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        // Append token to url
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  });

  busboy.end(req.rawBody);
};
