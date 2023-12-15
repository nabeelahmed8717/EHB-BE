const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/users");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Email already exists");


  user = await User.findOne({ userName: req.body.userName });
  if (user) return res.status(400).send("UserName is already taken.");

  
  user = new User(
    _.pick(req.body, [
      "firstName",
      "lastName",
      "userName",
      "email",
      "country",
      "phoneNumber",
      "password",
      "referralCode",
      "affUser",
    ])
  );

  const salt = await bcrypt.genSalt(15);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  res.send(_.pick(user, ["_id", "firstName", "lastName", "email"]));
});
module.exports = router;
