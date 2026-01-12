const express = require("express");
const router = express.Router();
const {
  fetchComplement,
  createComplement,
  updateComplement,
  deleteComplement,
} = require("../../controllers/ComplementController");
const { validation } = require("../../validation");
const { complementVal } = require("../../validation/complement");

router.get("/", fetchComplement);
router.post("/", complementVal, validation, createComplement);
router.patch("/", complementVal, validation, updateComplement);
router.delete("/", deleteComplement);
module.exports = router;
