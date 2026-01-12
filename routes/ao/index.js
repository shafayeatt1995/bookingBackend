const express = require("express");
const { isAO } = require("../../middleware");
const router = express.Router();

router.use(isAO);

module.exports = router;
