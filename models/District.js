const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DistrictSchema = new Schema(
  {
    divisionID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    bnName: { type: String, required: true },
    slug: { type: String, unique: true, index: true, lowercase: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("District", DistrictSchema);
