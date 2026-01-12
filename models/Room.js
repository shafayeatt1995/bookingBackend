const mongoose = require("mongoose");
const { randomKey } = require("../utils");
const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    hotelID: { type: Schema.Types.ObjectId, required: true },
    locationID: { type: Schema.Types.ObjectId, required: true },
    roomTypeID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Room", RoomSchema);
