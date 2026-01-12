const mongoose = require("mongoose");
const { randomKey } = require("../utils");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomTypeID: { type: Schema.Types.ObjectId, required: true },
  roomIDs: { type: [Schema.Types.ObjectId], required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  tax: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  totalTax: { type: Number, required: true },
  ownerAmount: { type: Number, required: true, select: false },
  commissionAmount: { type: Number, required: true, select: false },
  cancelStatus: { type: Boolean, required: true },
});

const BookingSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, default: "" },
    hotelID: { type: Schema.Types.ObjectId, required: true },
    locationID: { type: Schema.Types.ObjectId, required: true },
    roomIDs: { type: [Schema.Types.ObjectId], required: true },
    bookingNumber: { type: Number, unique: true },
    userName: { type: String, required: true },
    locationName: { type: String, required: true },
    adult: { type: Number, required: true },
    child: { type: Number, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    contactName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    contactAddress: { type: String, required: true },
    contactNote: { type: String, default: "" },
    guestNames: { type: [String], required: true },
    rooms: { type: [RoomSchema], required: true },
    paymentMethod: { type: String, required: true },
    totalRoomPrice: { type: Number, required: true },
    totalDiscount: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    totalPayable: { type: Number, required: true },
    transactionNumber: { type: String, default: "" },
    transactionDetails: { type: Object, select: false },
    ownerAmount: { type: Number, required: true, select: false },
    commissionAmount: { type: Number, required: true, select: false },
    cancelFee: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "complete", "cancel", "refund"],
      default: "pending",
    },
    otp: { type: String, default: randomKey(8) },
    verify: { type: Boolean, default: false },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

BookingSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const { Counter } = require(".");
      const counter = await Counter.findOneAndUpdate(
        { model: "Booking" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.bookingNumber = counter.sequenceValue;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
