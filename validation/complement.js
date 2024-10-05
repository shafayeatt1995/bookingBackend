const { check } = require("express-validator");

const validate = {
  complementVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("item").isLength({ min: 1 }).withMessage("Item required").trim(),
  ],
};

module.exports = validate;
