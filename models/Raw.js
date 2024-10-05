const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RawSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Raw", RawSchema);
