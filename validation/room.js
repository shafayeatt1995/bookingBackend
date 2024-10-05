const { check } = require("express-validator");

const validate = {
  roomVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("roomTypeID").isLength({ min: 1 }).withMessage("Name required"),
  ],
};

module.exports = validate;
