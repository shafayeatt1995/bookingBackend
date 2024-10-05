const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, required: true },
    hotelID: { type: Schema.Types.ObjectId, required: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
