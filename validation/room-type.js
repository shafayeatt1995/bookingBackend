const { check } = require("express-validator");
const { RoomType } = require("../models");

const validate = {
  roomTypeCreateVal: [
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
        const existing = await RoomType.findOne({ slug: value });
        if (existing) {
          throw new Error("Room type slug must be unique");
        }
        return true;
      }),
    check("accommodationType")
      .isLength({ min: 1 })
      .withMessage("Accommodation type required"),
    check("checkIn")
      .isLength({ min: 1 })
      .withMessage("Check in required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("checkOut")
      .isLength({ min: 1 })
      .withMessage("Check out required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("bedroom")
      .isLength({ min: 1 })
      .withMessage("Bedroom required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("bathroom")
      .isLength({ min: 1 })
      .withMessage("Bathroom required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("dealingAmount")
      .notEmpty()
      .withMessage("Dealing amount is required.")
      .isNumeric()
      .withMessage("Dealing amount must be number.")
      .custom((value) => value >= 0)
      .withMessage("Dealing amount must be a non-negative number"),
    check("commission")
      .notEmpty()
      .withMessage("Commission is required.")
      .isNumeric()
      .withMessage("Commission must be number.")
      .custom((value) => value >= 0)
      .withMessage("Commission must be a non-negative number"),
    check("cancelFee")
      .notEmpty()
      .withMessage("Cancel fee is required.")
      .isNumeric()
      .withMessage("Cancel fee must be number.")
      .custom((value) => value >= 0)
      .withMessage("Cancel fee must be a non-negative number"),
    check("cancelStatus")
      .notEmpty()
      .withMessage("Cancellation status is required.")
      .isBoolean()
      .withMessage("Cancellation status must be a boolean."),
    check("coin")
      .notEmpty()
      .withMessage("Coin is required.")
      .isNumeric()
      .withMessage("Coin must be number.")
      .custom((value) => value >= 0)
      .withMessage("Coin must be a non-negative number"),
    check("adult")
      .notEmpty()
      .withMessage("Adult is required.")
      .isNumeric()
      .withMessage("Adult must be number.")
      .custom((value) => value >= 0)
      .withMessage("Adult must be a non-negative number"),
    check("child")
      .notEmpty()
      .withMessage("Child is required.")
      .isNumeric()
      .withMessage("Child must be number.")
      .custom((value) => value >= 0)
      .withMessage("Child must be a non-negative number"),
    check("tax")
      .notEmpty()
      .withMessage("Tax is required.")
      .isNumeric()
      .withMessage("Tax must be number.")
      .custom((value) => value >= 0)
      .withMessage("Tax must be a non-negative number"),
    check("discount")
      .notEmpty()
      .withMessage("Discount is required.")
      .isNumeric()
      .withMessage("Discount must be number.")
      .custom((value) => value >= 0)
      .withMessage("Discount must be a non-negative number"),
    check("facilities")
      .notEmpty()
      .withMessage("Facilities is required.")
      .isArray({ min: 1 })
      .withMessage("Facilities is required."),
    check("complements")
      .isArray({ min: 0 })
      .withMessage("Complements is required."),
    check("bedPerRoomType")
      .notEmpty()
      .withMessage("Minimum 1 bed is required.")
      .isArray({ min: 1 })
      .withMessage("Minimum 1 bed is required."),
    check("images")
      .notEmpty()
      .withMessage("Minimum 1 images is required.")
      .isArray({ min: 1 })
      .withMessage("Minimum 1 images is required."),
  ],
  roomTypeUpdateVal: [
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
        const existing = await RoomType.findOne({
          slug: value,
          _id: { $ne: req.body._id },
        });
        if (existing) {
          throw new Error("Room type slug must be unique");
        }
        return true;
      }),
    check("accommodationType")
      .isLength({ min: 1 })
      .withMessage("Accommodation type required"),
    check("checkIn")
      .isLength({ min: 1 })
      .withMessage("Check in required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("checkOut")
      .isLength({ min: 1 })
      .withMessage("Check out required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("bedroom")
      .isLength({ min: 1 })
      .withMessage("Bedroom required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("bathroom")
      .isLength({ min: 1 })
      .withMessage("Bathroom required")
      .isLength({ max: 100 })
      .withMessage("Don't try to spam")
      .trim(),
    check("dealingAmount")
      .notEmpty()
      .withMessage("Dealing amount is required.")
      .isNumeric()
      .withMessage("Dealing amount must be number.")
      .custom((value) => value >= 0)
      .withMessage("Dealing amount must be a non-negative number"),
    check("cancelFee")
      .notEmpty()
      .withMessage("Cancel fee is required.")
      .isNumeric()
      .withMessage("Cancel fee must be number.")
      .custom((value) => value >= 0)
      .withMessage("Cancel fee must be a non-negative number"),
    check("cancelStatus")
      .notEmpty()
      .withMessage("Cancellation status is required.")
      .isBoolean()
      .withMessage("Cancellation status must be a boolean."),
    check("adult")
      .notEmpty()
      .withMessage("Adult is required.")
      .isNumeric()
      .withMessage("Adult must be number.")
      .custom((value) => value >= 0)
      .withMessage("Adult must be a non-negative number"),
    check("child")
      .notEmpty()
      .withMessage("Child is required.")
      .isNumeric()
      .withMessage("Child must be number.")
      .custom((value) => value >= 0)
      .withMessage("Child must be a non-negative number"),
    check("discount")
      .notEmpty()
      .withMessage("Discount is required.")
      .isNumeric()
      .withMessage("Discount must be number.")
      .custom((value) => value >= 0)
      .withMessage("Discount must be a non-negative number"),
    check("facilities")
      .notEmpty()
      .withMessage("Facilities is required.")
      .isArray({ min: 1 })
      .withMessage("Facilities is required."),
    check("complements")
      .isArray({ min: 0 })
      .withMessage("Complements is required."),
    check("bedPerRoomType")
      .notEmpty()
      .withMessage("Minimum 1 bed is required.")
      .isArray({ min: 1 })
      .withMessage("Minimum 1 bed is required."),
    check("images")
      .notEmpty()
      .withMessage("Minimum 1 images is required.")
      .isArray({ min: 1 })
      .withMessage("Minimum 1 images is required."),
  ],
};

module.exports = validate;
