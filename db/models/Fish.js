const mongoose = require("mongoose");

const fishSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name_uk: { type: String, required: true },
    name_lat: { type: String, required: true },
    family: { type: String, required: true },
    habitat_slug: { type: String, required: true },
    region: { type: String, required: true },
    size_cm: { type: Number, required: true },
    lifespan_years: { type: Number, required: true },
    diet: { type: String, required: true },
    care_level: { type: String, required: true },
    temperature: { type: String, required: true },
    ph: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    facts: { type: [String], required: true },
    image: { type: String, required: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Fish", fishSchema);
