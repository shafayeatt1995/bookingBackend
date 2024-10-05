const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExtraServiceSchema = new Schema(
  {
    hotelID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("ExtraService", ExtraServiceSchema);
