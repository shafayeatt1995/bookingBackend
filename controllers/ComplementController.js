const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { Complement } = require("../models");
const { paginate, message } = require("../utils");

const controller = {
  async fetchComplement(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const { hotel } = req.user;
      const matchQuery = { hotelID: new ObjectId(hotel._id) };
      if (search) {
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { item: { $regex: new RegExp(search, "i") } },
        ];
      }

      const items = await Complement.aggregate([
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
  async createComplement(req, res) {
    try {
      const { hotel } = req.user;
      const { name, item } = req.body;
      await Complement.create({ name, item, hotelID: hotel._id });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateComplement(req, res) {
    try {
      const { hotel } = req.user;
      const { _id, name, item } = req.body;
      await Complement.updateOne(
        { _id, hotelID: new ObjectId(hotel._id) },
        { name, item }
      );
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteComplement(req, res) {
    try {
      const { hotel } = req.user;
      const { _id } = req.query;
      await Complement.deleteOne({ _id, hotelID: new ObjectId(hotel._id) });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
