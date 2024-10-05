const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true, lowercase: true },
    image: { type: String, default: "/images/location/placeholder.webp" },
    status: { type: Boolean, default: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Location", LocationSchema);
