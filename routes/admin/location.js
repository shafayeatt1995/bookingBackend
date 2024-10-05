const express = require("express");
const router = express.Router();
const {
  fetchLocation,
  createLocation,
  updateLocation,
  toggleStatusLocation,
} = require("../../controllers/LocationController");
const { validation } = require("../../validation");
const {
  locationCreateVal,
  locationUpdateVal,
} = require("../../validation/location");

router.get("/", fetchLocation);
router.post("/", locationCreateVal, validation, createLocation);
router.patch("/", locationUpdateVal, validation, updateLocation);
router.get("/toggle-status", toggleStatusLocation);

module.exports = router;
