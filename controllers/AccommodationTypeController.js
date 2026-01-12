const { AccommodationType } = require("../models");
const { paginate, message } = require("../utils");

const controller = {
  async fetchAccommodationType(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [{ name: { $regex: new RegExp(search, "i") } }];
      }

      const items = await AccommodationType.aggregate([
        { $match: matchQuery },
        { $sort: { _id: -1 } },
        ...paginate(page, perPage),
      ]);
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async createAccommodationType(req, res) {
    try {
      const { name, slug, image } = req.body;
      await AccommodationType.create({ name, slug, image });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateAccommodationType(req, res) {
    try {
      const { _id, name, slug, image } = req.body;
      await AccommodationType.updateOne({ _id }, { name, slug, image });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteAccommodationType(req, res) {
    try {
      const { _id } = req.query;
      await AccommodationType.deleteOne({ _id });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
