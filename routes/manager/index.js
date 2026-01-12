const express = require("express");
const router = express.Router();
const { isManager } = require("../../middleware");
const { fetchManagerDashboard } = require("../../controllers/CommonController");

router.use(isManager);
router.use("/dashboard", fetchManagerDashboard);

module.exports = router;
