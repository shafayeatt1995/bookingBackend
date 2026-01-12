const express = require("express");
const router = express.Router();
const {
  fetchFacility,
  createFacility,
  updateFacility,
  toggleStatusFacility,
  deleteFacility,
} = require("../../controllers/FacilityController");
const { validation } = require("../../validation");
const { facilityVal } = require("../../validation/facility");

router.get("/", fetchFacility);
router.post("/", facilityVal, validation, createFacility);
router.patch("/", facilityVal, validation, updateFacility);
router.delete("/", deleteFacility);
router.get("/toggle-status", toggleStatusFacility);
module.exports = router;
