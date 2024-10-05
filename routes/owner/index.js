const express = require("express");
const router = express.Router();
const { isOwner } = require("../../middleware");
const { fetchOwnerDashboard } = require("../../controllers/CommonController");

router.use(isOwner);
router.use("/dashboard", fetchOwnerDashboard);
router.use("/extra-service", require("./extra-service"));
router.use("/room", require("./room"));
router.use("/room-type", require("./room-type"));

module.exports = router;
