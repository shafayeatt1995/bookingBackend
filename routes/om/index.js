const express = require("express");
const { isOM } = require("../../middleware");
const router = express.Router();

const { getSalesLog } = require("../../controllers/CommonController");
const {
  fetchDashboardBooking,
} = require("../../controllers/BookingController");

router.use(isOM);
router.use("/complement", require("./complement"));
router.post("/sales-log", getSalesLog);
router.post("/fetch-booking", fetchDashboardBooking);

module.exports = router;
