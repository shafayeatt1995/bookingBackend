const { check } = require("express-validator");

const validate = {
  facilityVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
  ],
};

module.exports = validate;
