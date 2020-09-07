require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

//API Router
app.use("/api", require('./routes/api/index'));

app.use("/", (req, res) => {
  app.send("Welcome !");
});

app.use("/favicon.ico", (req, res) => {
  app.sendFile("/public/favicon.ico");
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));