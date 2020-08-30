require("dotenv").config();
const express = require("express");
const router = express.Router();


//Send SMS Router
router.use("/send", require("./send"));










module.exports = router;