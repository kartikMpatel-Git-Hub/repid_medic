const mongoose = require("mongoose");

const CommonUserSchema = new mongoose.Schema({
  userId: { type: String,  unique: true }, // ✅ Changed ObjectId to String
  name: { type: String,  },
  email: { type: String,  unique: true },
  password: { type: String,  },
  category: { type: String, enum: ["admin", "customer", "vendor", "pharmist"], },
  phoneno: { type:String },
});

module.exports = mongoose.model("CommonUser", CommonUserSchema);