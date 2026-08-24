const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    caption: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Gallery", gallerySchema);
