const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, required: true },
    hotelID: { type: Schema.Types.ObjectId, required: true },
    roomID: { type: Schema.Types.ObjectId, required: true },
    bookingID: { type: Schema.Types.ObjectId, required: true, unique: true },
    message: { type: String, default: "", trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    staff: { type: Number, required: true, min: 1, max: 5 },
    facility: { type: Number, required: true, min: 1, max: 5 },
    location: { type: Number, required: true, min: 1, max: 5 },
    valueForMoney: { type: Number, required: true, min: 1, max: 5 },
    bedRoom: { type: Number, required: true, min: 1, max: 5 },
    washroom: { type: Number, required: true, min: 1, max: 5 },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
