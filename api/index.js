const express = require("express");
const router = express.Router();

const db = require("../db");

router.use("/users", require('./users/index'));


router.get('/', (req, res) => {
  let usersCollection = db.collection("users");
  usersCollection.find({}).toArray((err, result) => {
    if (err) res.send(err);
    else {
      res.send(JSON.stringify(result, null, '\t'));
    }
  });

});
  

module.exports = router;
