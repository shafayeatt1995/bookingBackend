const express = require("express");
const router = express.Router();
const {
  fetchAccommodationType,
  createAccommodationType,
  updateAccommodationType,
  deleteAccommodationType,
} = require("../../controllers/AccommodationTypeController");
const { validation } = require("../../validation");
const {
  accTypeCreateVal,
  accTypeUpdateOmVal,
} = require("../../validation/accommodation-type");

router.get("/", fetchAccommodationType);
router.post("/", accTypeCreateVal, validation, createAccommodationType);
router.patch("/", accTypeUpdateOmVal, validation, updateAccommodationType);
router.delete("/", deleteAccommodationType);
module.exports = router;
