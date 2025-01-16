const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CountrySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { strict: true }
);

module.exports = mongoose.model("Country", CountrySchema);
