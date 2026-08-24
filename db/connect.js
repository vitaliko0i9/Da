const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://maksmasov10_db_user:T4W50EckO8Lus0ls@ac-ybj1kua-shard-00-00.emwl75k.mongodb.net:27017,ac-ybj1kua-shard-00-01.emwl75k.mongodb.net:27017,ac-ybj1kua-shard-00-02.emwl75k.mongodb.net:27017/aquafauna?ssl=true&replicaSet=atlas-z4z7i0-shard-0&authSource=admin&appName=Cluster0";

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB Atlas → підключено");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
