const { check } = require("express-validator");
const { BedType } = require("../models");

const validate = {
  bedTypeCreateVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("icon").isLength({ min: 1 }).withMessage("Icon required"),
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
        const existing = await BedType.findOne({ slug: value });
        if (existing) {
          throw new Error("Hotel slug must be unique");
        }
        return true;
      }),
  ],
  bedTypeUpdateVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("icon").isLength({ min: 1 }).withMessage("Icon required"),
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

        const existing = await BedType.findOne({
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
