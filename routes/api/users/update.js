require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../../../db");
const emailValidator = require("email-validator");
const errorCodes = require("../../../errorCodes.json");
let ObjectId = require("mongodb").ObjectId;
//Global resut variable to check for the password if not admin

router.post("/", async (req, res) => {
  try {
    //Check if user is logged in to edit his profile or even an admin
    if (!req.user) {
      return res.json({
        success: false,
        codes: [151],
        messages: [errorCodes["151"]],
      });
    }

    let user = req.body;
    //Initial error array
    let errors = [];

    /*----------VALIDATION START---------*/

    //check if user is updating another user ==> admin is ok to update
    if (req.user.userType != "admin" && req.user._id != req.body._id)
      return res.json({
        success: false,
        codes: [152],
        messages: [errorCodes["152"]],
      });

    //If user is not admin ==> he can change any input he wants
    if (req.user.userType != "admin") {
      //Make sure all required inputs are available for the update
      if (!user.firstName) errors.push(115);
      if (!user.lastName) errors.push(116);
      if (!user.phoneNumber) errors.push(117);
      if (!user.countryCode) errors.push(118);
      if (!user.email) errors.push(100);
      if (!user.gender) errors.push(120);
      if (!user.dateOfBirth) errors.push(121);
      if (!user.school) errors.push(122);
      if (!user.address) errors.push(123);
      if (!user.country) errors.push(124);
      if (!user.region) errors.push(125);
    }

    //Validate Email
    if (!emailValidator.validate(user.email)) errors.push(103);

    //Check if id exist or not
    let userSearch = await db
      .collection("users")
      .findOne({ _id: ObjectId(user._id) });
    if (userSearch == null) errors.push(151);

    /*----------VALIDATION END---------*/

    //If there any error , stop and send errors
    if (errors.length != 0) {
      return res.json({
        success: false,
        codes: errors,
        messages: errors.map((err) => errorCodes[err.toString()]),
      });
    }

    //ON SUCCESS proceed
    let updatedUser = await db.collection("users").findOneAndUpdate(
      { _id: ObjectId(user._id) },
      {
        $set: {
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          email: user.email,
          gender: user.gender,
          dateOfBirth: parseInt(user.dateOfBirth),
          school: user.school,
          address: user.address,
          country: user.country,
          region: user.region,
        },
      }
    );

    if (updatedUser.value) {

      //remove the accessToken from the updatedUser object
      delete updatedUser.value.accessToken;
      
      return res.json({
        success: true,
        codes: [204],
        messages: [errorCodes["204"]],
        updatedUser: updatedUser.value
      })
    }
    
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      codes: [0],
      messages: [`${errorCodes["0"]}: ${e.message}`],
    });
  }
});

module.exports = router;
