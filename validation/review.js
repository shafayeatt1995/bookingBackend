const { check } = require("express-validator");

const validate = {
  reviewCreateVal: [
    check("roomID")
      .notEmpty()
      .withMessage("Room ID required")
      .isMongoId()
      .withMessage("Invalid room ID format"),
    check("bookingID")
      .notEmpty()
      .withMessage("Booking ID required")
      .isMongoId()
      .withMessage("Invalid booking ID format"),
    check("hotelID")
      .notEmpty()
      .withMessage("Hotel ID required")
      .isMongoId()
      .withMessage("Invalid hotel ID format"),
    check("staff")
      .notEmpty()
      .withMessage("Staff is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Staff is required"),
    check("facility")
      .notEmpty()
      .withMessage("Facility is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Facility is required"),
    check("location")
      .notEmpty()
      .withMessage("Location is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Location is required"),
    check("valueForMoney")
      .notEmpty()
      .withMessage("Value for money is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Value for money is required"),
    check("bedRoom")
      .notEmpty()
      .withMessage("Beds & rooms is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Beds & rooms is required"),
    check("washroom")
      .notEmpty()
      .withMessage("Washrooms & toilets is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Washrooms & toilets is required"),
  ],
};

module.exports = validate;
