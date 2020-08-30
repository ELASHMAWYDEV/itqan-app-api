require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../../db");
const emailValidator = require("email-validator");
// const phoneValidator = require("validate-phone-number-node-js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorCodes = require("../../../errorCodes.json");




//Global @params
let errors = [];
let userResult = null;


router.post("/", async (req, res) => {

  //check if user already logged in
  if (req.user)
    return res.json({
      success: true,
      codes: [201],
      messages: [errorCodes["201"]],
    });
  
  
  /*-----if user not registered, proceed ↓----*/
  let user = req.body;

  try {

    //check for empty inputs
    if (!user.email && user.loginType == "email") errors.push(100);
    if (!user.password) errors.push(110);
    if (!user.phoneNumber && user.loginType == "phoneNumber") errors.push(117);

    //Validate Email
    if (!emailValidator.validate(user.email)) errors.push(103);

    //Check for email or phone number in database
    if (user.loginType == "email") {
      db.collection("users").findOne({ email: user.email }, (err, result) => {
        if (err) errors.push(1);
        if (result != null) {
          userResult = result;
        } else {
          errors.push(101);
        }
      });
    }
    if (user.loginType == "phoneNumber") {
      db.collection("users").findOne({ phoneNumber: user.phoneNumber }, (err, result) => {
        if (err) errors.push(1);
        if (result != null) {
          userResult = result;
        } else {
          errors.push(104);
        }
      });
    }

    
    //Check if password is OK
    if (userResult && bcrypt.compare(user.password, userResult.password)) {
      //Create the JWT token to send it to the user
      accessToken = jwt.sign(
        userResult,
        process.env.ACCESS_TOKEN_SECRET
      );
    } else {
      errors.push(111);
    }
    
    //Final Step ==> send errors or send SUCCESS LOGIN
    if (errors.length == 0) {
      res.json({
        success: true,
        codes: [200],
        messages: [errorCodes["200"]],
        user: userResult,
        accessToken: accessToken
      });
      //Empty errors
      return errors = [];
    } else {
      res.json({
        success: false,
        codes: errors,
        messages: [errors.map(err => errorCodes[err.toString()])]
      });
      return errors = [];
    }


  } catch (e) {
    res.json({
      success: false,
      codes: [0],
      messages: [`${errorCodes["0"]}: ${e}`]
    });
    return errors = [];
  }

});

module.exports = router;
