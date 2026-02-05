const mongoose = require("mongoose");
const config = require("./index");

const connectDatabase = () => {
  mongoose
    .connect(config.mongodbUri)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
};
module.exports = connectDatabase;
