const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/users");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the login identifier is an email or username
  let user = await User.findOne({
    $or: [{ email: req.body.identifier }, { userName: req.body.identifier }],
  });

  if (!user) return res.status(400).send("Invalid email or password");

  // Check if the password is already encrypted
  const isPasswordEncrypted = user.password.startsWith("$2b$");

  let validPassword;
  if (isPasswordEncrypted) {
    // Password is already encrypted, validate using bcrypt
    validPassword = await bcrypt.compare(req.body.password, user.password);
  } else {
    // Password is not encrypted, validate without bcrypt
    validPassword = req.body.password === user.password;
  }

  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();
  res.json({ token });
});

function validate(req) {
  const schema = {
    identifier: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(req, schema);
}

module.exports = router;
