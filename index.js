require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());


//API Router
app.use("/api", require('./routes/api/index'));



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));