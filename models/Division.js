const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DivisionSchema = new Schema(
  {
    name: { type: String, required: true },
    bnName: { type: String, required: true },
    slug: { type: String, unique: true, index: true, lowercase: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Division", DivisionSchema);
