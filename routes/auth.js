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
  let user = await User.findOne({
    $or: [{ email: req.body.identifier}, { userName: req.body.identifier }],
  });
  
  // let user = await User.findOne({
  //   $or: [{ email: req.body.identifier }, { userName: req.body.identifier }],
  // });

  // const identifier = req.body.identifier.toLowerCase()

  console.log(user); 

  if (!user) return res.status(400).send("Invalid email or password");

  const isPasswordEncrypted = user.password.startsWith("$2b$");

  let validPassword;
  if (isPasswordEncrypted) {

    validPassword = await bcrypt.compare(req.body.password, user.password);
  } else {

    validPassword = req.body.password === user.password;
  }

  if (!validPassword) return res.status(400).send("Invalid email or password");

  const token = user.generateAuthToken();
  res.json({ token });
});

function validate(req) {
  const schema = {
    identifier: Joi.string().min(1).max(255).required(),
    password: Joi.string().min(1).max(255).required(),
  };
  return Joi.validate(req, schema);
}

module.exports = router;
