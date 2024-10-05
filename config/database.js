// const mongoose = require("mongoose");
// const time = Date.now();
// const mongoUrl = process.env.MONGO_URL;
// const autoIncrement = require("mongoose-auto-increment");

// mongoose.set("strictQuery", false);

// mongoose
//   .connect(mongoUrl, {
//     autoIndex: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {})
//   .catch((err) => console.error("Error connecting to mongo", err))
//   .finally(() =>
//     console.log("Mongo connected time", (Date.now() - time) / 1000 + "sec")
//   );

// const connection = mongoose.connection;
// autoIncrement.initialize(connection);
// connection.on("error", (error) => console.error(error));
// mongoose.Promise = global.Promise;

// if (process.env.MONGO_LOGS === "1") {
//   mongoose.set("debug", true);
// }

const mongoose = require("mongoose");

const mongo = {
  async mongoConnect() {
    mongoose.set("strictQuery", true);
    const maxRetries = 5;
    let attempts = 0;

    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB is already connected.");
      return;
    }

    while (attempts < maxRetries) {
      try {
        await mongoose.connect(process.env.MONGO_URL, { autoIndex: true });
        console.log("MongoDB Connected");
        return;
      } catch (error) {
        attempts++;
        console.error(`MongoDB connection attempt ${attempts} failed:`, error);

        if (attempts === maxRetries) {
          console.error("Failed to connect to MongoDB after maximum retries.");
          throw new Error("MongoDB connection error");
        }

        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  },

  async mongoDisconnect() {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log("MongoDB is already disconnected.");
        return;
      }
      await mongoose.disconnect();
      console.log("MongoDB Disconnected");
    } catch (error) {
      console.error("MongoDB disconnection error:", error);
      throw error;
    }
  },
};

module.exports = mongo;
