const nodemailer = require("nodemailer");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
        service: "gmail",
        auth: {
            user: "ehb.developers@gmail.com",
            pass: "rans lftl dghr cgts",
        }
    });

    const mailOptions = {
        from: "ehb.developers@gmail.com",
        to: user.email,
        subject: "Password Reset",
        html: `
        <div style="
    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;
    ">
        <img src="https://cdn-icons-png.flaticon.com/128/673/673069.png" alt="" style="height: 100px; width: 100px;">
        <h4 style="white-space: nowrap;">Reset Your Password</h4>
        <div>
            <p style="font-size: 14px;"><strong>Hello!</strong></p>
            <p style="font-size: 14px;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
            <p style="font-size: 14px;">Please click on the following link to complete the process:</p>
            <a href="https://ehb-live.com/reset-password/${user.resetPasswordToken}">
                <button style="
                    background-color: #0984e3;
                    border: none;
                    border-radius: 24px;
                    padding: 10px 18px;
                    color: aliceblue;
                    height: fit-content;">
                    Reset Password
                </button>
            </a>
            <p style="font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        </div>
    </div>`,

    };
    // const mailOptions = {
    //     from: "ehb.developers@gmail.com",
    //     to: user.email,
    //     subject: "Password Reset",
    //     text:
    //         `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
    //         `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
    //         `https://ehb-live.com/reset-password/${user.resetPasswordToken}\n\n` +
    //         `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    // };

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