const mongoose = require("mongoose");
const { Review, Hotel, RoomType } = require("../models");
const { message, average, objectID } = require("../utils");

const controller = {
  async submitReview(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { _id: userID } = req.user;
      const {
        bookingID,
        hotelID,
        roomID,
        staff,
        facility,
        location,
        valueForMoney,
        bedRoom,
        washroom,
        message,
      } = req.body;
      const rating = await average(
        staff,
        facility,
        location,
        valueForMoney,
        bedRoom,
        washroom
      );
      await Review.create({
        bookingID,
        userID,
        hotelID,
        roomID,
        staff,
        facility,
        location,
        valueForMoney,
        bedRoom,
        washroom,
        message,
        rating,
      });

      const hotelReviews = await Review.aggregate([
        { $match: { hotelID: objectID(hotelID) } },
        { $project: { rating: 1 } },
      ]).session(session);

      const avgHotelRating = await average(
        ...hotelReviews.map(({ rating }) => +rating),
        rating
      );

      await Hotel.findOneAndUpdate(
        { hotelID },
        { rating: avgHotelRating },
        { session }
      );

      const roomReviews = await Review.aggregate([
        { $match: { hotelID: objectID(hotelID) } },
        { $project: { rating: 1 } },
      ]).session(session);

      const avgRoomRating = await average(
        ...roomReviews.map(({ rating }) => +rating),
        rating
      );
      await RoomType.findOneAndUpdate(
        { _id: roomID },
        { rating: avgRoomRating },
        { session }
      );

      await session.commitTransaction();
      await session.endSession();
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      await session.endSession();
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
