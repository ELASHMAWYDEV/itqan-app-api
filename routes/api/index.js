require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../../db");



//Middleware to check for JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //set the req.user = null ===> check for req.user in every private route
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) req.user = null;

    let userSearch = await db.collection("users").findOne({ accessToken: token });
    
    if (userSearch) req.user = userSearch;
    else req.user = null;

    next();
  });
};

router.use(authenticateToken);
/*############################################*/




//Auth Router
router.use("/auth", require('./auth/index'));

//SMS Router
router.use("/sms", require('./sms/index'));

//USERS Router
router.use("/users", require('./users/index'));




//Main API Router
router.get('/', (req, res) => {
  res.send("Working Fine !");

});
  

module.exports = router;
