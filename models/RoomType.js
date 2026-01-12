const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomTypeSchema = new Schema(
  {
    hotelID: { type: Schema.Types.ObjectId, required: true },
    locationID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    accommodationType: { type: Schema.Types.ObjectId, required: true },
    dealingAmount: { type: Number, required: true },
    commission: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    price: { type: Number, required: true },
    cancelFee: { type: Number, required: true },
    cancelStatus: { type: Boolean, default: false },
    coin: { type: Number, required: true },
    bedroom: { type: String, required: true },
    bathroom: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    adult: { type: Number, required: true },
    child: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, required: true },
    facilities: { type: [Schema.Types.ObjectId], default: [] },
    complements: { type: [Schema.Types.ObjectId], default: [] },
    bedPerRoomType: {
      type: [Schema.Types.ObjectId],
      default: [],
      required: true,
    },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    approved: { type: Boolean, default: false },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("RoomType", RoomTypeSchema);
