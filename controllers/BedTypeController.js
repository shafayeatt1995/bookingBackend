const { BedType } = require("../models");
const { paginate, message } = require("../utils");

const controller = {
  async fetchBedType(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [{ name: { $regex: new RegExp(search, "i") } }];
      }

      const items = await BedType.aggregate([
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
  async createBedType(req, res) {
    try {
      const { name, slug, icon } = req.body;
      await BedType.create({ name, slug, icon });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateBedType(req, res) {
    try {
      const { _id, name, slug, icon } = req.body;
      await BedType.updateOne({ _id }, { name, slug, icon });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteBedType(req, res) {
    try {
      const { _id } = req.query;
      await BedType.deleteOne({ _id });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
