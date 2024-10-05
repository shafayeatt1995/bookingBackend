const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");

router.get("/", (req, res) => {
  return res.json({ success: `Welcome to ${process.env.APP_NAME}` });
});
router.get("/check-connect", async (req, res) => {
  try {
    const connection = mongoose.connection.readyState === 1;
    return res.json({ success: true, connection });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});
router.use("/fetch", require("./fetch"));
router.use("/scrap", require("./scrap"));
router.use("/auth", require("./auth"));

router.use(isAuthenticated);
router.use("/admin", require("./admin"));
router.use("/om", require("./om"));
router.use("/am", require("./am"));
router.use("/ao", require("./ao"));
router.use("/user", require("./user"));
router.use("/owner", require("./owner"));
router.use("/manager", require("./manager"));

module.exports = router;
