const { check } = require("express-validator");
const { endDate } = require("../utils");

const validate = {
  bookingInitiateVal: [
    check("hotelID").notEmpty().withMessage("Hotel ID required"),
    check("adult")
      .notEmpty()
      .withMessage("Adult required")
      .isInt({ min: 1 })
      .withMessage("Adult must be more than 1"),
    check("child")
      .notEmpty()
      .withMessage("Child required")
      .isInt({ min: 0 })
      .withMessage("Child should not be a negative number"),
    check("checkIn")
      .notEmpty()
      .withMessage("Check-in date is required")
      .isISO8601()
      .withMessage("Check-in date must be a valid date")
      .custom((value, { req }) => {
        if (!(new Date(value) >= new Date(req.body.today))) {
          throw new Error("Check-in date must be equal or later than today");
        }
        return true;
      }),
    check("checkOut")
      .notEmpty()
      .withMessage("Check-out date is required")
      .isISO8601()
      .withMessage("Check-out date must be a valid date")
      .custom((value, { req }) => {
        if (!(endDate(value) >= endDate(req.body.checkIn))) {
          throw new Error("Check-out date must be equal or later than today");
        }
        return true;
      }),
    check("contactName").notEmpty().withMessage("Contact name required"),
    check("contactNumber").notEmpty().withMessage("Contact number required"),
    check("contactAddress").notEmpty().withMessage("Contact address required"),
    check("contactNote")
      .optional()
      .isString()
      .withMessage("Contact note must be a string"),
    check("guestNames")
      .isArray({ min: 1 })
      .withMessage("Guest names must have at least one name")
      .custom((value) => {
        if (!value.every((name) => typeof name === "string")) {
          throw new Error("All guest names must be strings");
        }
        return true;
      }),
    check("paymentMethod").notEmpty().withMessage("Payment methods required"),
    check("totalRoomPrice")
      .notEmpty()
      .withMessage("Total room price required")
      .isInt({ min: 0 })
      .withMessage("Total room price should not be a negative number"),
    check("totalDiscount")
      .notEmpty()
      .withMessage("Total discount required")
      .isInt({ min: 0 })
      .withMessage("Total discount should not be a negative number"),
    check("totalTax")
      .notEmpty()
      .withMessage("Total tax required")
      .isInt({ min: 0 })
      .withMessage("Total tax should not be a negative number"),
    check("totalPayable")
      .notEmpty()
      .withMessage("Total payable required")
      .isInt({ min: 0 })
      .withMessage("Total payable should not be a negative number"),
    check("rooms")
      .isArray({ min: 1 })
      .withMessage("Rooms must be an array with at least one item")
      .custom((rooms) => {
        rooms.forEach((room) => {
          if (
            typeof room.roomTypeID !== "string" ||
            room.roomTypeID.trim().length === 0
          ) {
            throw new Error("Room Type ID must be a non-empty string");
          }
          if (typeof room.name !== "string" || room.name.trim().length === 0) {
            throw new Error("Room name must be a non-empty string");
          }
          if (typeof room.quantity !== "number" || room.quantity <= 0) {
            throw new Error("Room quantity must be a positive number");
          }
          if (typeof room.price !== "number" || room.price <= 0) {
            throw new Error("Room price must be a positive number");
          }
          if (typeof room.discount !== "number" || room.discount < 0) {
            throw new Error("Room discount must be a non-negative number");
          }
          if (typeof room.tax !== "number" || room.tax < 0) {
            throw new Error("Room tax must be a non-negative number");
          }
        });
        return true;
      }),
  ],
  bookingVerifyVal: [
    check("_id").notEmpty().withMessage("Booking ID required"),
    check("otp").notEmpty().withMessage("OTP required"),
    check("method").notEmpty().withMessage("Method required"),
    check("transactionNumber")
      .notEmpty()
      .withMessage("Transaction number required"),
  ],
};

module.exports = validate;
