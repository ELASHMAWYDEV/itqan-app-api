const express = require("express");
const router = express.Router();

const db = require("../../db");

router.use("/register", require('./register'));
router.use("/login", require('./login'));


router.get('/', (req, res) => {
  res.send("Welcome");

});
  

module.exports = router;
