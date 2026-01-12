const { check } = require("express-validator");
const { AccommodationType } = require("../models");

const validate = {
  accTypeCreateVal: [
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
      .custom(async (value) => {
        if (value.includes(" ")) {
          throw new Error("Can't use space on slug");
        }
        const existing = await AccommodationType.findOne({ slug: value });
        if (existing) {
          throw new Error("Accommodation type slug must be unique");
        }
        return true;
      }),
    check("image")
      .isLength({ min: 1 })
      .withMessage("Image required")
      .isLength({ max: 200 })
      .withMessage("Don't try to spam"),
  ],
  accTypeUpdateOmVal: [
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
        const existing = await AccommodationType.findOne({
          slug: value,
          _id: { $ne: req.body._id },
        });
        if (existing) {
          throw new Error("Accommodation type slug must be unique");
        }
        return true;
      }),
    check("image")
      .isLength({ min: 1 })
      .withMessage("Image required")
      .isLength({ max: 200 })
      .withMessage("Don't try to spam"),
  ],
};

module.exports = validate;
