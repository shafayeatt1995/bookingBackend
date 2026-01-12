const { check } = require("express-validator");

const validate = {
  extraServiceVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("price")
      .notEmpty()
      .withMessage("Price is required.")
      .isNumeric()
      .withMessage("Price must be number."),
  ],
};

module.exports = validate;
