const express = require("express");
const router = express.Router();
const {
  fetchExtraService,
  createExtraService,
  updateExtraService,
  deleteExtraService,
} = require("../../controllers/ExtraServiceController");
const { validation } = require("../../validation");
const { extraServiceVal } = require("../../validation/extraservice");

router.get("/", fetchExtraService);
router.post("/", extraServiceVal, validation, createExtraService);
router.patch("/", extraServiceVal, validation, updateExtraService);
router.delete("/", deleteExtraService);
module.exports = router;
