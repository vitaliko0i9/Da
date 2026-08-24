const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI не задано. Перевірте файл .env (див. .env.example).");
}

mongoose.set("strictQuery", true);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB Atlas → підключено");
  return mongoose.connection;
}

module.exports = connectDB;
