const express = require("express");
const { Division, District, Raw } = require("../../models");
const router = express.Router();

router.get("/division", async (req, res) => {
  try {
    await District.updateMany(
      { divisionID: "67841ab20bf0a5769dc70151" },
      { divisionID: "6783aca91213402d056f3b15" }
    );
    const divisions = await Division.find({
      countryID: "6783a68bce6cb38b139a9611",
    }).select({ name: 1 });
    return res.json({ divisions });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});
router.get("/district/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const districts = await District.find({ divisionID: id }).select({
      name: 1,
    });
    return res.json({ districts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});
router.post("/demo-post", async (req, res) => {
  try {
    const {
      _id,
      title,
      slug,
      map,
      content,
      division,
      district,
      divisionName,
      districtName,
    } = req.body;

    await Raw.create({ name: "demo-post", url: JSON.stringify(req.body) });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});
module.exports = router;
