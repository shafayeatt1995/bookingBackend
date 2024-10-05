const { Facility } = require("../models");
const { paginate, message, toggle } = require("../utils");

const controller = {
  async fetchFacility(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [{ name: { $regex: new RegExp(search, "i") } }];
      }

      const items = await Facility.aggregate([
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
  async createFacility(req, res) {
    try {
      const { name, icon } = req.body;
      const data = { name };
      if (icon) data.icon = icon;
      await Facility.create(data);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateFacility(req, res) {
    try {
      const { _id, name, icon } = req.body;
      await Facility.updateOne({ _id }, { name, icon });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteFacility(req, res) {
    try {
      const { _id } = req.query;
      await Facility.deleteOne({ _id });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async toggleStatusFacility(req, res) {
    try {
      const { _id } = req.query;
      await Facility.updateOne({ _id }, [toggle("status")]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
