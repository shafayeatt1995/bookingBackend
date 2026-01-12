const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ComplementSchema = new Schema(
  {
    hotelID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
    item: { type: String, required: true, trim: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Complement", ComplementSchema);
