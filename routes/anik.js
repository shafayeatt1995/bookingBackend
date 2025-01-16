const express = require("express");
const { Division, District } = require("../models");
const { stringSlug, randomKey } = require("../utils");
// const puppeteer = require("puppeteer");
const router = express.Router();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

router.get("/", async (req, res) => {
  try {
    const array = [
      "Altenburger Land",
      "Eichsfeld",
      "Gera",
      "Greiz",
      "Jena",
      "Kyffhäuserkreis",
      "Nordhausen",
      "Saale-Holzland-Kreis",
      "Saale-Orla-Kreis",
      "Saalfeld-Rudolstadt",
      "Schmalkalden-Meiningen",
      "Weimar",
      "Weimarer Land",
      "Wartburgkreis",
      "Erfurt",
      "Mühlhausen",
    ];

    for (const name of array) {
      const slug = stringSlug(name);
      const exist = await District.findOne({ slug });
      await District.create({
        countryID: "6783a68bce6cb38b139a9611",
        divisionID: "6783aca91213402d056f3b24",
        name,
        slug: exist ? `${exist.slug}-${randomKey(4)}` : slug,
      });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error,
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;
