const { Location } = require("../models");
const { paginate, message } = require("../utils");

const controller = {
  async fetchLocation(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { slug: { $regex: new RegExp(search, "i") } },
        ];
      }

      const items = await Location.aggregate([
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
  async createLocation(req, res) {
    try {
      const { name, slug, image } = req.body;
      await Location.create({ name, slug, image });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateLocation(req, res) {
    try {
      const { _id, name, slug, image } = req.body;
      await Location.updateOne({ _id }, { name, slug, image });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async toggleStatusLocation(req, res) {
    try {
      const { _id } = req.query;
      await Location.updateOne({ _id }, [
        { $set: { status: { $eq: [false, "$status"] } } },
      ]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
