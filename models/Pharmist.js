const mongoose = require("mongoose");

const PharmistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  shopName: { type: String, required: true },
  address: { type: String, required: true }
});

module.exports = mongoose.model("Pharmist", PharmistSchema);
