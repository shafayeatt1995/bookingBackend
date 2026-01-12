const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const {
  Hotel,
  Room,
  AccommodationType,
  Facility,
  BedType,
  Complement,
} = require("../models");
const { paginate, message, hasOne, toggle } = require("../utils");

const controller = {
  async fetchRoom(req, res) {
    try {
      const { hotel } = req.user;
      const { page, perPage, search } = req.query;
      const matchQuery = { hotelID: new ObjectId(hotel._id) };
      if (search) {
        matchQuery.$or = [{ name: { $regex: new RegExp(search, "i") } }];
      }

      const items = await Room.aggregate([
        { $match: matchQuery },
        { $sort: { _id: -1 } },
        ...paginate(page, perPage),
        ...hasOne("roomTypeID", "roomtypes", "roomType", ["name"]),
      ]);
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchHotelInformation(req, res) {
    try {
      const { hotel } = req.user;
      const complements = await Complement.find({
        hotelID: new ObjectId(hotel._id),
      });
      return res.json({ complements });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async createRoom(req, res) {
    try {
      const { hotel } = req.user;
      const { name, roomTypeID } = req.body;
      await Room.create({
        hotelID: hotel._id,
        locationID: hotel.locationID,
        roomTypeID,
        name,
      });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateRoom(req, res) {
    try {
      const { hotel } = req.user;
      const { _id, name, roomTypeID } = req.body;
      await Room.findOneAndUpdate(
        { _id, hotelID: new ObjectId(hotel._id) },
        {
          hotelID: hotel._id,
          locationID: hotel.locationID,
          roomTypeID,
          name,
        }
      );
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteRoom(req, res) {
    try {
      const { hotel } = req.user;
      const { _id } = req.query;
      await Room.findOneAndDelete({ _id, hotelID: new ObjectId(hotel._id) });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async toggleRoomStatus(req, res) {
    try {
      const { _id } = req.query;
      await Room.updateOne({ _id }, toggle("status"));
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
