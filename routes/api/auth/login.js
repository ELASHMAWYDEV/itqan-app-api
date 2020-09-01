require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../../db");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorCodes = require("../../../errorCodes.json");

router.post("/", async (req, res) => {
  //Initial errors empty array
  let errors = [];
  let userResult = null;
  let accessToken = null;

  //check if user already logged in
  if (req.user)
    return res.json({
      success: true,
      codes: [201],
      messages: [errorCodes["201"]],
    });

  /*-----if user not logged in, proceed ↓----*/
  let user = req.body;

  try {
    /*---------VALIDATION START--------- */
    //check for empty inputs
    if (!user.email && user.loginType == "email") errors.push(100);
    if (!user.password) errors.push(110);
    if (!user.phoneNumber && user.loginType == "phoneNumber") errors.push(117);

    //Validate Email
    if (!emailValidator.validate(user.email)) errors.push(103);

    //Check for email or phone number in database
    if (user.loginType == "email" || !user.loginType) {
      userResult = await db.collection("users").findOne({ email: user.email });

      if (!userResult) errors.push(101);
    }

    if (user.loginType == "phoneNumber") {
      userResult = await db
        .collection("users")
        .findOne({ phoneNumber: user.phoneNumber });

      if (!userResult) errors.push(104);
    }

    //Check if password is OK
    if (
      userResult &&
      (await bcrypt.compare(user.password, userResult.password))
    ) {

      //remove the last access token from userResult ===> don't send it with the user object
      delete userResult.accessToken;

      //Create the JWT token to send it to the user
      accessToken = jwt.sign(userResult, process.env.ACCESS_TOKEN_SECRET);
      console.log(accessToken);
      //store the token to the user in DB
      let storeToken = await db
        .collection("users")
        .findOneAndUpdate({ _id: userResult._id }, { $set: { accessToken: `${accessToken}` } }, {returnNewDocument: true});
      if (!storeToken.value) errors.push(2);
      console.log(storeToken);
    } else {
      errors.push(111);
    }

    //Final Step ==> send errors or send SUCCESS LOGIN
    if (errors.length == 0) {
      return res.json({
        success: true,
        codes: [201],
        messages: [errorCodes["201"]],
        user: userResult,
        accessToken
      });
    } else {
      return res.json({
        success: false,
        codes: errors,
        messages: [errors.map((err) => errorCodes[err.toString()])],
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      codes: [0],
      messages: [`${errorCodes["0"]}: ${e}`],
    });
  }
});

module.exports = router;
