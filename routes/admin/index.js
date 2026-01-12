const express = require("express");
const { isSuperAdmin } = require("../../middleware");
const router = express.Router();

router.use(isSuperAdmin);
router.use("/user", require("./user"));
router.use("/hotel", require("./hotel"));
router.use("/location", require("./location"));
router.use("/facility", require("./facility"));
router.use("/accommodation-type", require("./accommodation-type"));
router.use("/bed-type", require("./bed-type"));
router.use("/room-type", require("./room-type"));
router.use("/blog", require("./blog"));

module.exports = router;
