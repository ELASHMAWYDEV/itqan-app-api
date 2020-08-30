require("dotenv").config();
const express = require("express");
const router = express.Router();
const twilio = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const errorCodes = require("../../../errorCodes.json");

//Middleware to check for the twilio sid and Auth token in the .env file
router.use((req, res, next) => {
  if (
    !process.env.TWILIO_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    return res.status(400).send({
      success: "false",
      message: errorCodes["150"],
    });
  } else {
    next();
  }
});

router.post("/", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  try {
    const sms = await twilio.messages.create({
      to: phoneNumber,
      from: twilioNumber,
      body: "شكرا لإستخدامك خدمات محمود العشماوي :)",
    });

    res.json(sms);
  } catch (e) {
    res.json({
      success: false,
      message: e.message,
    });
  }
});

module.exports = router;
