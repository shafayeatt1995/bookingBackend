const express = require("express");
const router = express.Router();
const {
  fetchHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  suspendHotel,
  fetchHotelOM,
  fetchOMUsers,
  updateOmUser,
  fetchLocation,
} = require("../../controllers/HotelController");
const { validation } = require("../../validation");
const { hotelCreateVal, hotelUpdateVal } = require("../../validation/hotel");

router.get("/", fetchHotel);
router.get("/location", fetchLocation);
router.get("/om", fetchHotelOM);
router.get("/users/om", fetchOMUsers);
router.post("/users/om", updateOmUser);
router.post("/", hotelCreateVal, validation, createHotel);
router.patch("/", hotelUpdateVal, validation, updateHotel);
router.delete("/", deleteHotel);
router.put("/", suspendHotel);

module.exports = router;
