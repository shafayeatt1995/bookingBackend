const express = require("express");
const router = express.Router();
const {
  fetchHotelInformation,
  createRoom,
  fetchRoom,
  updateRoom,
  deleteRoom,
  toggleRoomStatus,
} = require("../../controllers/RoomController");
const { validation } = require("../../validation");
const { roomVal } = require("../../validation/room");

router.get("/", fetchRoom);
router.post("/", roomVal, validation, createRoom);
router.patch("/", roomVal, validation, updateRoom);
router.delete("/", deleteRoom);
router.get("/status", toggleRoomStatus);
router.get("/information", fetchHotelInformation);
module.exports = router;
