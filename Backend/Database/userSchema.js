const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  password: { type: String, required: true },
  favoriteCryptos: [
    {
      coinId: { type: String, required: true },
      coinName: { type: String, required: true },
    },
  ],
});

const userModel = mongoose.model("userModel", userSchema);
module.exports = userModel;
