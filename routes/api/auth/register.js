require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../../db");
const bcrypt = require("bcrypt");
const errorCodes = require("../../../errorCodes.json");
const emailValidator = require("email-validator");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    let user = req.body;
    let errors = validateUser(user);

    //If any errors after validation ==> retrun the errors and stop execution
    if (errors.length != 0) {
      return res.json({
        success: false,
        codes: errors,
        messages: errors.map((err) => errorCodes[err.toString()]),
      });
    }

    //Create the hashed password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user = {
      ...user,
      password: hashedPassword,
    };

    //Insert the user to the Database
    db.collection("users").insertOne({ ...user }, (err, result) => {
      if (err) errors.push(1);

      if (result && result.insertedCount == 1) {
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

        return res.json({
          success: true,
          code: 203,
          message: errorCodes["203"],
          user,
          accessToken,
        });
      } else {
        return res.json({
          success: false,
          codes: [0],
          messages: [errorCodes["0"]],
        });
      }
    });
  } catch (e) {
    return res.json({
      success: false,
      codes: [0],
      messages: [`${errorCodes["0"]}: ${e.message}`],
    });
  }
});

//VALIDATION
const validateUser = (user) => {
  //Initial error array
  let errors = [];

  //Make sure all required inputs are available
  if (!user.firstName) errors.push(115);
  if (!user.lastName) errors.push(116);
  if (!user.phoneNumber) errors.push(117);
  if (!user.countryCode) errors.push(118);
  if (!user.email) errors.push(100);
  if (!user.password) errors.push(110);
  if (!user.passwordConfirm) errors.push(113);

  //Password Validation
  if (user.password.length < 6) errors.push(112);

  //Validate Email
  if (!emailValidator.validate(user.email)) errors.push(103);

  //check if email exist
  db.collection("users").findOne({ email: user.email }, (err, result) => {
    if (err) errors.push(1);
    if (result !== null) errors.push(102);
    console.log(result);
  });

  //check if phone number exist with its country code
  db.collection("users").findOne(
    {
      $and: [
        { phoneNumber: user.phoneNumber },
        { countryCode: user.countryCode },
      ],
    },
    (err, result) => {
      if (err) errors.push(1);
      if (result !== null) errors.push(105);
      // console.log(result);
    }
  );

  return errors;
};

module.exports = router;
