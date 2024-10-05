const express = require("express");
const router = express.Router();
const {
  fetchNotApproved,
  toggleApprovedRoomType,
  deleteRoomType,
} = require("../../controllers/RoomTypeController");

router.get("/toggle-approve", toggleApprovedRoomType);
router.get("/not-approved", fetchNotApproved);
router.delete("/", deleteRoomType);
module.exports = router;
