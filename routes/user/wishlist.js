const express = require("express");
const router = express.Router();
const {
  toggleWishlist,
  fetchWishlist,
  fetchAllWishlist,
} = require("../../controllers/WishlistController");

router.get("/", fetchWishlist);
router.post("/", toggleWishlist);
router.post("/all", fetchAllWishlist);

module.exports = router;
