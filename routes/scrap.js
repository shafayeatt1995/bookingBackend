const {
  // divisionDistrict,
  collectPostLink,
  createPost,
  convertImage,
  updatePostSlug,
  updateGo,
  updatePost,
  changeImageName,
  refetch,
  updatePostManually,
  refetchBN,
  collectCholozaiPost,
  createBnPost,
  updateGoBn,
  uploadImage,
  createRedirect,
  replaceText,
  replaceQuote,
  updateTitle,
} = require("../controllers/ScrapController");
const express = require("express");
const router = express.Router();

// router.get("/division-district", divisionDistrict);
router.get("/collect-post-link", collectPostLink);
// router.get("/create-post", createPost);
// router.get("/create-bn-post", createBnPost);
router.get("/update-post", updatePost);
// router.get("/convert-public-images", convertImage);
router.post("/update-post-slug", updatePostSlug);
router.get("/update-post-slug", updatePostSlug);
router.post("/update-post-manually", updatePostManually);
router.get("/update-go", updateGo);
router.get("/update-go-bn", updateGoBn);
// router.get("/refetch/:slug", refetch);
// router.get("/collect-cholozai-post", collectCholozaiPost);
// router.get("/change-image-name", changeImageName);
router.post("/upload/image", uploadImage);
router.post("/replace", replaceText);
router.get("/create-redirect", createRedirect);
router.get("/replace-quote", replaceQuote);
router.get("/update-title", updateTitle);

module.exports = router;
