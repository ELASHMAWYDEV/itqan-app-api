require("dotenv").config();
const express = require("express");
const router = express.Router();




router.use("/register", require("./register"));
router.use("/login", require("./login"));

router.get("/", (req, res) => {
  res.status(403).json({
    error: true,
    message: "You are not allowed to enter this route !",
  });
});




module.exports = router;
