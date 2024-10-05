const mongoose = require("mongoose");
const { RoomType, Hotel } = require("../models");
const { paginate, message, hasOne, toggle, objectID } = require("../utils");

const controller = {
  async fetchRoomType(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const { hotel } = req.user;
      const matchQuery = { hotelID: objectID(hotel._id) };
      if (search) {
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { slug: { $regex: new RegExp(search, "i") } },
        ];
      }

      const items = await RoomType.aggregate([
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
  async fetchNotApproved(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { slug: { $regex: new RegExp(search, "i") } },
        ];
      }

      const items = await RoomType.aggregate([
        { $match: matchQuery },
        { $sort: { approved: 1, _id: -1 } },
        ...paginate(page, perPage),
        ...hasOne("hotelID", "hotels", "hotel", ["name"]),
        {
          $project: {
            name: 1,
            hotel: 1,
            approved: 1,
          },
        },
      ]);

      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async createRoomType(req, res) {
    try {
      const {
        name,
        slug,
        accommodationType,
        dealingAmount,
        commission,
        cancelFee,
        cancelStatus = false,
        coin,
        bedroom,
        bathroom,
        checkIn,
        checkOut,
        adult,
        child,
        tax,
        discount,
        facilities,
        complements,
        bedPerRoomType,
        images,
      } = req.body;

      const { hotel } = req.user;
      const baseAmount = Math.ceil((+dealingAmount - +discount) / 500) * 500;
      const commissionAmount = baseAmount * (+commission / 100);
      const price = +dealingAmount - +discount;
      const taxAmount = Math.round(+price * (+tax / 100));
      await RoomType.create({
        hotelID: hotel._id,
        locationID: hotel.locationID,
        name,
        slug,
        accommodationType,
        dealingAmount,
        commission,
        commissionAmount,
        price,
        discount,
        cancelFee,
        cancelStatus,
        coin,
        bedroom,
        bathroom,
        checkIn,
        checkOut,
        adult,
        child,
        tax,
        taxAmount,
        facilities,
        complements,
        bedPerRoomType,
        images,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateRoomType(req, res) {
    try {
      const {
        _id,
        name,
        slug,
        accommodationType,
        dealingAmount,
        cancelFee,
        cancelStatus = false,
        bedroom,
        bathroom,
        checkIn,
        checkOut,
        adult,
        child,
        discount,
        facilities,
        complements,
        bedPerRoomType,
        images,
      } = req.body;
      const roomType = await RoomType.findOne({ _id });

      if (roomType) {
        const { hotel } = req.user;
        const baseAmount = Math.ceil((+dealingAmount - +discount) / 500) * 500;
        const commissionAmount = baseAmount * (+roomType.commission / 100);
        const price = +dealingAmount - +discount;
        const updateRoomType = await RoomType.findOneAndUpdate(
          { _id, hotelID: hotel._id },
          {
            hotelID: hotel._id,
            locationID: hotel.locationID,
            name,
            slug,
            accommodationType,
            dealingAmount,
            commissionAmount,
            price,
            discount,
            cancelFee,
            cancelStatus,
            bedroom,
            bathroom,
            checkIn,
            checkOut,
            adult,
            child,
            facilities,
            complements,
            bedPerRoomType,
            images,
          }
        );

        if (updateRoomType) {
          let minPrice = 0;
          let minPriceDiscount = 0;
          const [sortPrice] = await RoomType.aggregate([
            { $match: { hotelID: objectID(hotel._id) } },
            { $sort: { price: 1 } },
            { $limit: 1 },
            { $project: { _id: 0, price: 1, discount: 1 } },
          ]);

          if (sortPrice) {
            minPrice = sortPrice.price || 0;
            minPriceDiscount = sortPrice.discount || 0;
          }

          await Hotel.findOneAndUpdate(
            { _id: hotel._id },
            { minPriceDiscount, minPrice }
          );
        }
      }
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async toggleApprovedRoomType(req, res) {
    try {
      const { _id } = req.query;
      await RoomType.findOneAndUpdate({ _id }, { approved: true });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteRoomType(req, res) {
    try {
      const { _id } = req.query;
      await RoomType.deleteOne({ _id });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchApproveRoomType(req, res) {
    try {
      const { hotel } = req.user;
      const roomType = await RoomType.find({
        hotelID: objectID(hotel._id),
        approved: true,
      }).select({ name: 1 });
      return res.json({ roomType });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async toggleRoomTypeStatus(req, res) {
    try {
      const { _id } = req.query;
      await RoomType.findOneAndUpdate({ _id }, toggle("status"));
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
