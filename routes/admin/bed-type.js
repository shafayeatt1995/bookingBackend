const express = require("express");
const router = express.Router();
const {
  fetchBedType,
  createBedType,
  updateBedType,
  deleteBedType,
} = require("../../controllers/BedTypeController");
const { validation } = require("../../validation");
const {
  bedTypeCreateVal,
  bedTypeUpdateVal,
} = require("../../validation/bedtype");

router.get("/", fetchBedType);
router.post("/", bedTypeCreateVal, validation, createBedType);
router.patch("/", bedTypeUpdateVal, validation, updateBedType);
router.delete("/", deleteBedType);
module.exports = router;
