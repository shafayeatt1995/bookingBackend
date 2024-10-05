const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HotelSchema = new Schema(
  {
    locationID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    address: { type: String, required: true },
    mapAddress: { type: String, required: true },
    logo: { type: String, default: "/images/hotel/logo.svg" },
    image: { type: String, default: "/images/hotel/default.png" },
    rating: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    managers: { type: [Schema.Types.ObjectId], default: [] },
    owners: { type: [Schema.Types.ObjectId], default: [] },
    suspended: { type: Boolean, default: false, select: false },
    deleted: { type: Boolean, default: false, select: false },
    facilities: { type: [Schema.Types.ObjectId], required: true, default: [] },
    about: { type: String, default: "", trim: true },
    bankAccountNumber: { type: String, required: true, trim: true },
    bankAccountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accommodations: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: [],
    },
    minPrice: { type: Number, default: 0 },
    minPriceDiscount: { type: Number, default: 0 },
    nid: { type: Boolean, default: true, require: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Hotel", HotelSchema);
