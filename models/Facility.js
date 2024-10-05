const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FacilitySchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, default: '<i class="fa-solid fa-check"></i>' },
    status: { type: Boolean, default: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Facility", FacilitySchema);
