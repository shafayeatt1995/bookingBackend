const express = require("express");
const router = express.Router();

const {
  bookingInitiate,
  bookingVerify,
  fetchBookingDetails,
  fetchBooking,
  makePayment,
} = require("../../controllers/BookingController");
const {
  bookingInitiateVal,
  bookingVerifyVal,
} = require("../../validation/booking");
const { validation } = require("../../validation");

router.post("/fetch", fetchBooking);
router.post("/make-payment", makePayment);
router.post("/initiate", bookingInitiateVal, validation, bookingInitiate);
router.post("/verify", bookingVerifyVal, validation, bookingVerify);
router.post("/details", fetchBookingDetails);

module.exports = router;
