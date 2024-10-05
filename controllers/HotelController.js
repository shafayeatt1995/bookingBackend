const { Hotel, User, Location, RoomType } = require("../models");
const {
  paginate,
  message,
  hasOne,
  objectID,
  arrayConverter,
  hasMany,
} = require("../utils");

const controller = {
  async fetchHotel(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { slug: { $regex: new RegExp(search, "i") } },
        ];
      }

      const items = await Hotel.aggregate([
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
  async fetchOMUsers(req, res) {
    try {
      const { page, perPage, search } = req.query;
      let items = [];
      if (search) {
        const matchQuery = { type: "user" };
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { email: { $regex: new RegExp(search, "i") } },
        ];

        items = await User.aggregate([
          { $match: matchQuery },
          { $sort: { _id: -1 } },
          ...paginate(page, perPage),
        ]);
      }
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateOmUser(req, res) {
    try {
      const { managers, owners, _id } = req.body;
      if (managers.length === 0 && owners.length === 0) {
        await Hotel.updateOne({ _id }, { managers, owners });
        return res.json({ success: true });
      } else {
        const allUsers = [...managers, ...owners];
        const exist =
          (await Hotel.findOne({
            _id: { $ne: _id },
            $or: [
              { managers: { $in: allUsers } },
              { owners: { $in: allUsers } },
            ],
          }).exec()) !== null;
        if (exist) {
          return res.status(422).json({
            email: { msg: "User already connected with another hotel" },
          });
        } else {
          await Hotel.updateOne({ _id }, { managers, owners });
          return res.json({ success: true });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchHotelOM(req, res) {
    try {
      const { managers, owners } = req.query;
      const [manager, owner] = await Promise.all([
        User.find({ _id: { $in: managers } }).select({ name: 1, email: 1 }),
        User.find({ _id: { $in: owners } }).select({ name: 1, email: 1 }),
      ]);
      return res.json({ manager, owner });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async createHotel(req, res) {
    try {
      const {
        name,
        slug,
        address,
        locationID,
        mapAddress,
        accommodations,
        facilities,
        bankAccountNumber,
        bankAccountHolderName,
        bankName,
        nid,
      } = req.body;
      await Hotel.create({
        name,
        slug,
        address,
        locationID,
        mapAddress,
        accommodations,
        facilities,
        bankAccountNumber,
        bankAccountHolderName,
        bankName,
        nid,
      });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateHotel(req, res) {
    try {
      const {
        _id,
        name,
        slug,
        address,
        locationID,
        mapAddress,
        accommodations,
        facilities,
        bankAccountNumber,
        bankAccountHolderName,
        bankName,
        nid,
      } = req.body;
      await Hotel.updateOne(
        { _id },
        {
          name,
          slug,
          address,
          locationID,
          mapAddress,
          accommodations,
          facilities,
          bankAccountNumber,
          bankAccountHolderName,
          bankName,
          nid,
        }
      );
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async suspendHotel(req, res) {
    try {
      const { _id } = req.body;
      await Hotel.updateOne({ _id }, [
        { $set: { suspended: { $eq: [false, "$suspended"] } } },
      ]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteHotel(req, res) {
    try {
      const { _id } = req.query;
      await Hotel.updateOne({ _id }, [
        { $set: { deleted: { $eq: [false, "$deleted"] } } },
      ]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchLocation(req, res) {
    try {
      const locations = await Location.find({ status: true });
      return res.json({ locations });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
