const nodemailer = require("nodemailer");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/users");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();


router.post("/reset-password-request", async (req, res) => {
    const { error } = validateResetPasswordRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("User not found");

    // Generate a reset token and set an expiration time (e.g., 1 hour)
    user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send an email with a link to reset the password
    const transporter = nodemailer.createTransport({
        // Set up your email configuration (SMTP, service, etc.)
        // Example with Gmail:
        service: "gmail",
        auth: {
            user: "ehb.development@gmail.com",
            pass: "EHB*12345",
        },
    });

    const mailOptions = {
        from: "your-email@gmail.com",
        to: user.email,
        subject: "Password Reset",
        text:
            `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
            `${process.env.BASE_URL}/reset-password/${user.resetPasswordToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
    });

    res.send("Password reset email sent.");
});


router.post("/reset-password/:token", async (req, res) => {
    const { error } = validateResetPassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send("Invalid or expired token");

    // Update the password and remove the reset token
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.send("Password reset successfully");
});

function validateResetPassword(req) {
    const schema = {
        password: Joi.string().min(5).max(255).required(),
    };
    return Joi.validate(req, schema);
}

function validateResetPasswordRequest(req) {
    const schema = {
        email: Joi.string().email().required(),
    };
    return Joi.validate(req, schema);
}
module.exports = router;