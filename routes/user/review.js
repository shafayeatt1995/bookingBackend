const express = require("express");
const router = express.Router();
const { submitReview } = require("../../controllers/ReviewController");
const { validation } = require("../../validation");
const { reviewCreateVal } = require("../../validation/review");

router.post("/submit", reviewCreateVal, validation, submitReview);

module.exports = router;
