const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CounterSchema = new Schema(
  {
    model: { type: String, required: true, unique: true },
    sequenceValue: { type: Number, default: 0 },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Counter", CounterSchema);
