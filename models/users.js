const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  userName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  country: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  referralCode: {
    type: String,
    minlength: 0,
    maxlength: 50,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      referralCode: this.referralCode,
      phoneNumber: this.phoneNumber,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    userName: Joi.string().min(1).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    country: Joi.string().min(1).max(50).required(),
    phoneNumber: Joi.string().min(1).max(20).required(),
    password: Joi.string().min(5).max(255).required(),
    referralCode: Joi.string().max(50),
    resetPasswordExpires: Joi.string().max(50),
    resetPasswordToken: Joi.string().max(50),
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
