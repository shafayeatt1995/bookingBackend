const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { ExtraService } = require("../models");
const { paginate, message } = require("../utils");

const controller = {
  async fetchExtraService(req, res) {
    try {
      const { hotel } = req.user;
      const { page, perPage, search } = req.query;
      const matchQuery = { hotelID: new ObjectId(hotel._id) };
      if (search) {
        matchQuery.$or = [{ name: { $regex: new RegExp(search, "i") } }];
      }

      const items = await ExtraService.aggregate([
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
  async createExtraService(req, res) {
    try {
      const { hotel } = req.user;
      const { name, price } = req.body;
      await ExtraService.create({ name, price, hotelID: hotel._id });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateExtraService(req, res) {
    try {
      const { hotel } = req.user;
      const { _id, name, price } = req.body;
      await ExtraService.updateOne(
        { _id, hotelID: new ObjectId(hotel._id) },
        { name, price }
      );
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteExtraService(req, res) {
    try {
      const { hotel } = req.user;
      const { _id } = req.query;
      await ExtraService.deleteOne({ _id, hotelID: new ObjectId(hotel._id) });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
