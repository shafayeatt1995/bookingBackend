const express = require("express");
const router = express.Router();
const {
  createRoomType,
  fetchRoomType,
  deleteRoomType,
  fetchApproveRoomType,
  toggleRoomTypeStatus,
  updateRoomType,
} = require("../../controllers/RoomTypeController");
const { validation } = require("../../validation");
const {
  roomTypeCreateVal,
  roomTypeUpdateVal,
} = require("../../validation/room-type");

router.get("/approved", fetchApproveRoomType);
router.get("/", fetchRoomType);
router.post("/", roomTypeCreateVal, validation, createRoomType);
router.patch("/", roomTypeUpdateVal, validation, updateRoomType);
router.delete("/", deleteRoomType);
router.get("/toggle-status", toggleRoomTypeStatus);
module.exports = router;
