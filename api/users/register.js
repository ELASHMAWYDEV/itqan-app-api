const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  let user = req.body;

  //check if user exist first
  db.collection("users").findOne({ email: user.email }, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: true,
        message: err,
      });
    }
    if (result !== null) {
      return res.status(400).json({
        error: true,
        message: "This email is already registered",
      });
    }
  });

  if (res.headersSent) return;
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user = {
      ...user,
      password: hashedPassword,
    };
  } catch (e) {
    return res.status(400).json({
      error: true,
      message: e.message,
    });
  }

  if (res.headersSent) return;
  db.collection("users").insertOne({ ...user }, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: err,
        message: "A Database error occured",
      });
    } else if (result.insertedCount == 1) {
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "The user was not added to the database",
      });
    }
  });
});

module.exports = router;
