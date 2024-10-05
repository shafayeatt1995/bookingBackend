const express = require("express");
const router = express.Router();
const { profile } = require("../../controllers/UserController");
const { downloadInvoice } = require("../../controllers/BookingController");
const { validation } = require("../../validation");
const {
  updateProfileVal,
  updatePasswordVal,
  updateHotelVal,
} = require("../../validation/user");
const {
  updateProfile,
  updatePassword,
  updateHotel,
  refresh,
  updateToken,
} = require("../../controllers/UserController");

router.use("/image", require("./image"));
router.use("/booking", require("./booking"));
router.use("/wishlist", require("./wishlist"));
router.use("/review", require("./review"));
router.get("/profile", profile);
router.post("/refresh", refresh);
router.get("/update-profile", updateProfileVal, validation, updateProfile);
router.get("/update-Password", updatePasswordVal, validation, updatePassword);
router.post("/update-hotel", updateHotelVal, validation, updateHotel);
router.post("/invoice", downloadInvoice);
router.post("/update-token", updateToken);

module.exports = router;
