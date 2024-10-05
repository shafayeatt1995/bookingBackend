const { check } = require("express-validator");
const { Location } = require("../models");

const validate = {
  locationCreateVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
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
        const existing = await Location.findOne({ slug: value });
        if (existing) {
          throw new Error("Location slug must be unique");
        }
        return true;
      }),
  ],
  locationUpdateVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
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

        const existing = await Location.findOne({
          slug: value,
          _id: { $ne: req.body._id },
        });
        if (existing) {
          throw new Error("Location slug must be unique");
        }
        return true;
      }),
  ],
};

module.exports = validate;
