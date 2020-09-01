require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../../db");
const bcrypt = require("bcrypt");
const errorCodes = require("../../../errorCodes.json");
const emailValidator = require("email-validator");
const jwt = require("jsonwebtoken");

//Initial error array
router.post("/", async (req, res) => {
  try {
    let user = req.body;
    let errors = [];

    /*-------VALIDATION START------*/
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
    const emailSearch = await db
      .collection("users")
      .findOne({ email: user.email });

    if (emailSearch) errors.push(102);

    //check if phone number exist with its country code
    const phoneSearch = await db.collection("users").findOne({
      $and: [
        { phoneNumber: user.phoneNumber },
        { countryCode: user.countryCode },
      ],
    });

    if (phoneSearch) errors.push(105);

    /*------VALIDATION END--------*/

    //If any errors after validation ==> retrun the errors and stop execution


    //delete the passwordConfirm property from the User Object
    delete user.passwordConfirm;

    //Create the hashed password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user = {
      ...user,
      password: hashedPassword,
    };

    
    if (errors.length != 0) {
      return res.json({
        success: false,
        codes: errors,
        messages: errors.map((err) => errorCodes[err.toString()]),
      });
    }

    //Insert the user to the Database
    const result = await db.collection("users").insertOne({ ...user });
    if (!result) errors.push(0);

    if (result && result.insertedCount == 1) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      return res.json({
        success: true,
        codes: 203,
        messages: errorCodes["203"],
        user,
        accessToken,
      });
    }
    
    
  } catch (e) {
    return res.json({
      success: false,
      codes: [0],
      messages: [`${errorCodes["0"]}: ${e.message}`],
    });
  }
});

module.exports = router;
