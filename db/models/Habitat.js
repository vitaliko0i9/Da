const mongoose = require("mongoose");

const habitatSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    water_type: { type: String, required: true },
    temperature: { type: String, required: true },
    salinity: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Habitat", habitatSchema);
