const express = require("express");
const router = express.Router();
const {
  fetchImage,
  uploadImage,
  deleteImage,
} = require("../../controllers/ImageController");

router.get("/", fetchImage);
router.post("/", uploadImage);
router.delete("/", deleteImage);

module.exports = router;
