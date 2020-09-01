require("dotenv").config();
const express = require("express");
const router = express.Router();


router.use("/update", require("./update"));



module.exports = router;

