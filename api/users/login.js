const express = require("express");
const router = express.Router();
const db = require("../../db");
const emailValidator = require("email-validator");
const phoneValidator = require("validate-phone-number-node-js");
const bcrypt = require("bcrypt");






router.post("/", (req, res) => {
  const user = req.body;

  const type = emailValidator.validate(user.email) ? "email" : null;

  if (type === null) {
    return res.json({
      error: true,
      message: `Unknown login type: ${user.email}`,
    });
  }

  try {

    switch (type) {

      case "email":

        //check if user exist in DB
        db.collection("users").findOne({ email: user.email }, async (err, result) => {
          if (err) {
            return res.status(400).json({
              error: err,
              message: "Database Error",
            });
          }
          
          //if exist => compare the sent password with the one in database
          if (result !== null) {
            if (await bcrypt.compare(user.password, result.password)) {
              return res.json({
                success: true,
                message: "Login Successfull"
              })
            } else {
              return res.status(400).json({
                error: true,
                message: "The password you entered is incorrect"
              })
            }
          } else {
            return res.status(400).json({
              error: true,
              message: "You are not registerd"
            })
          }
        });
        break;
    }

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

module.exports = router;
