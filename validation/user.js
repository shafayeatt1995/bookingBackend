const { check } = require("express-validator");
const { User, Hotel } = require("../models");
const bcrypt = require("bcryptjs");

const validate = {
  userCreateVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("email")
      .isLength({ min: 1 })
      .withMessage("Email or phone required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim()
      .custom(async (value) => {
        try {
          const checkIsUserAllowed = (email) => {
            const admin_emails = new Set(["shafayetalanik@gmail.com"]);
            return admin_emails.has(email);
          };
          const user = await User.findOne({ email: value.toLowerCase() });
          if (user || checkIsUserAllowed(value)) {
            throw new Error("Email already is use!");
          }
          return true;
        } catch (err) {
          throw new Error(err.message);
        }
      }),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam"),
  ],
  userUpdateVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("email")
      .isLength({ min: 1 })
      .withMessage("Email or phone required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim()
      .custom(async (value, { req }) => {
        try {
          const checkIsUserAllowed = (email) => {
            const admin_emails = new Set(["shafayetalanik@gmail.com"]);
            return admin_emails.has(email);
          };
          const user = await User.findOne({
            email: value.toLowerCase(),
            _id: { $ne: req.body._id },
          });
          if (user || checkIsUserAllowed(value)) {
            throw new Error("Email already is use!");
          }
          return true;
        } catch (err) {
          throw new Error(err.message);
        }
      }),
  ],
  updateProfileVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
  ],
  updatePasswordVal: [
    check("old")
      .notEmpty()
      .withMessage("Old password is required")
      .isLength({ min: 6 })
      .withMessage("Old password must be at least 6 characters")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ _id: req.user._id }, { password: 1 });
        const check = await bcrypt.compare(value, user.password);
        if (!check) {
          throw new Error("Old password is not correct");
        }
        return true;
      }),
    check("new")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .custom((value, { req }) => {
        if (value === req.query.old) {
          throw new Error(
            "New password cannot be the same as the old password"
          );
        }
        return true;
      }),
    check("confirm")
      .notEmpty()
      .withMessage("Confirm password is required")
      .isLength({ min: 6 })
      .withMessage("Confirm password must be at least 6 characters")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .custom((value, { req }) => {
        if (value !== req.query.new) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  updateHotelVal: [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Name required 2")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("about").optional().isString().withMessage("About must be a string "),
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
          _id: { $ne: req.user.hotel._id },
        });
        if (existing) {
          throw new Error("Hotel slug must be unique");
        }
        return true;
      }),
    check("address")
      .isLength({ min: 1 })
      .withMessage("Address required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("image")
      .isLength({ min: 1 })
      .withMessage("Image required")
      .isLength({ max: 200 })
      .withMessage("Don't try to spam"),
    check("images").isArray().withMessage(`Images data isn't correct`),
    check("facilities").isArray().withMessage(`Facilities data isn't correct`),
    check("nid")
      .notEmpty()
      .withMessage("NID is required.")
      .isBoolean()
      .withMessage("NID must be a boolean."),
  ],
};

module.exports = validate;
