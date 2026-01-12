const express = require("express");
const { isAM } = require("../../middleware");
const router = express.Router();

router.use(isAM);

module.exports = router;
