const { check } = require("express-validator");
const { Hotel } = require("../models");

const val = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name required")
    .isLength({ max: 100 })
    .withMessage("Don't try to spam")
    .trim(),
  check("address")
    .isLength({ min: 1 })
    .withMessage("Address required")
    .isLength({ max: 100 })
    .withMessage("Don't try to spam")
    .trim(),
  check("locationID").isLength({ min: 1 }).withMessage("Location required"),
  check("mapAddress")
    .isLength({ min: 1 })
    .withMessage("Google map address required"),
  check("accommodations")
    .isArray({ min: 1 })
    .withMessage("Accommodating is required."),
  check("facilities")
    .isArray({ min: 1 })
    .withMessage("Accommodating is required."),
  check("bankAccountNumber")
    .isLength({ min: 1 })
    .withMessage("Bank account number required")
    .isLength({ max: 100 })
    .withMessage("Don't try to spam")
    .trim(),
  check("bankAccountHolderName")
    .isLength({ min: 1 })
    .withMessage("Bank account holder name required")
    .isLength({ max: 100 })
    .withMessage("Don't try to spam")
    .trim(),
  check("bankName")
    .isLength({ min: 1 })
    .withMessage("Bank name required")
    .isLength({ max: 100 })
    .withMessage("Don't try to spam")
    .trim(),
  check("nid")
    .notEmpty()
    .withMessage("NID is required.")
    .isBoolean()
    .withMessage("NID must be a boolean."),
];
const validate = {
  hotelCreateVal: [
    ...val,
    check("slug")
      .isLength({ min: 1 })
      .withMessage("Slug required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim()
      .custom(async (value, { req }) => {
        if (value.includes(" ")) {
          throw new Error("Can't use space on slug");
        }
        const existing = await Hotel.findOne({ slug: value });
        if (existing) {
          throw new Error("Hotel slug must be unique");
        }
        return true;
      }),
  ],
  hotelUpdateVal: [
    ...val,
    check("slug")
      .isLength({ min: 1 })
      .withMessage("Slug required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim()
      .custom(async (value, { req }) => {
        if (value.includes(" ")) {
          throw new Error("Can't use space on slug");
        }

        const existing = await Hotel.findOne({
          slug: value,
          _id: { $ne: req.body._id },
        });
        if (existing) {
          throw new Error("Hotel slug must be unique");
        }
        return true;
      }),
  ],
};

module.exports = validate;
