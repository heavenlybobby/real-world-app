const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  totalDeposit: {
    type: Number,
    default: 0.00
  },
  totalProfit: {
    type: Number,
    default: 0.00
  },
  accountWithdrawable: {
    type: Number,
    default: 0.00
  },
  totalWithdrawn: {
    type: Number,
    default: 0.00
  },
  verified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);