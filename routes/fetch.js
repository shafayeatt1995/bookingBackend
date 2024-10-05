const express = require("express");
const router = express.Router();
const {
  fetchAllLocation,
  fetchHomeData,
  fetchLocationsProperty,
  fetchAllFacilitiesOnce,
  fetchAllAccommodationType,
  fetchSearchHotels,
  fetchSingleHotelData,
  fetchHotelRoomTypes,
  fetchReview,
  fetchReviewSummary,
  fetchAllBedsOnce,
} = require("../controllers/CommonController");

router.get("/home-data", fetchHomeData);
router.get("/location-property", fetchLocationsProperty);
router.get("/all-location", fetchAllLocation);
router.get("/all-facilities", fetchAllFacilitiesOnce);
router.get("/all-beds", fetchAllBedsOnce);
router.get("/all-accommodation-type", fetchAllAccommodationType);
router.post("/single-hotel-data", fetchSingleHotelData);
router.post("/search-hotels", fetchSearchHotels);
router.post("/hotel-room-types", fetchHotelRoomTypes);
router.post("/review", fetchReview);
router.post("/review-summary", fetchReviewSummary);

module.exports = router;
