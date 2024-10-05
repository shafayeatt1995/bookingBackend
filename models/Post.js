const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    districtID: { type: Schema.Types.ObjectId, required: false },
    district: { type: String, required: true },
    url: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    bnTitle: { type: String, required: false, default: "" },
    slug: { type: String, required: true, unique: true },
    content: { type: [], required: true },
    bnContent: { type: [], required: false, default: [] },
    postDate: { type: Date, default: new Date() },
    lang: { type: String, required: true, default: "en", enum: ["en", "bn"] },
    map: { type: String },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Post", PostSchema);
