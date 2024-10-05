const { Wishlist, Hotel } = require("../models");
const { paginate, message, hasOne, objectID } = require("../utils");

const controller = {
  async fetchWishlist(req, res) {
    try {
      const { _id: userID } = req.user;
      const items = await Wishlist.find({ userID });
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async toggleWishlist(req, res) {
    try {
      const { _id: hotelID } = req.body;
      const { _id: userID } = req.user;

      const existingItem = await Wishlist.findOne({ userID, hotelID });

      existingItem
        ? await Wishlist.deleteOne({ _id: existingItem._id })
        : await Wishlist.create({ userID, hotelID });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchAllWishlist(req, res) {
    try {
      const { hotelIDs, page, perPage } = req.body;

      if (!Array.isArray(hotelIDs)) {
        return res.status(400).json({ message: "hotelIDs must be an array" });
      }

      const items = await Hotel.aggregate([
        { $match: { _id: { $in: hotelIDs.map((id) => objectID(id)) } } },
        ...paginate(page, perPage),
      ]);

      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
