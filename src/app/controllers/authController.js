const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth");

const User = require("../models/User");

const router = express.Router();

function generateToken(params = {}) {
    let options = { expiresIn: 86400 }; // 1 Day
    if(params.privilege && params.privilege == 1) // API Site
        delete options.expiresIn;
	return jwt.sign(params, authConfig.secret, options);
}

router.post("/register", async (req, res) => {
	try {
		const { email } = req.body;

        if(req.body.privilege) 
            req.body.privilege = undefined;

		if(await User.findOne({ email }))
			return res.status(400).json({ error: "E-mail already in use!"});

		const user = await User.create(req.body);

        const userPrivilege = user.privilege;
        user.privilege = undefined;
		user.password = undefined;
        user.privilege = undefined;
        user.__v = undefined;
        user.createdAt = undefined;
		user.updatedAt = undefined;

		return res.status(200).json({
			user,
			token: generateToken({ id: user.id, pribilege: userPrivilege })
		});
	} catch(err) {
		return res.status(400).json({ error: err.message || "Unexpected error!"});
	}
});

router.post("/authenticate", async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).select("+password +privilege");

		if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

		if(!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const userPrivilege = user.privilege;
        user.privilege = undefined;
		user.password = undefined;

		return res.status(200).json({ 
            user, 
            token: generateToken({ id: user.id, privilege: userPrivilege })
        });
	} catch(err) {
		return res.status(400).json({ error: err.message || "Unexpected error!"});
	}
});

router.post("/forgot_password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const token = crypto.randomBytes(20).toString("hex");
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            "$set": {
                passwordResetToken: token,
                passwordResetExpire: now
            }
        });

        mailer.sendMail({
            to: email,
            from: "My Team <team@test.com>",
            subject: "Forgot Password",
            template: "auth/forgot_password",
            context: { token }
        }, (err) => {
            if(err) {
                return res.status(400).json({ error: "Cannot send forgot password mail!"});
            }
            return res.status(200).send();
        });
    } catch(err) {
        return res.status(400).json({ error: err.message || "Unexpected error" });
    }
});

router.post("/reset_password", async (req, res) => {
    try {
        const { email, token, password } = req.body;
        const user = await User.findOne({ email })
            .select("+passwordResetToken passwordResetExpire");

        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if(token !== user.passwordResetToken) {
            return res.status(400).json({ error: "Token Invalid" });
        }

        const now = new Date();

        if(now > user.passwordResetExpire) {
            return res.status(400).json({ error: "Token expired, generate a new one" });
        }

        user.password = password;
        await user.save();

        return res.status(200).send();
    } catch(err) {
        return res.status(400).json({ error: err.message || "Unexpected error" });
    }
});

module.exports = (app) => app.use("/auth", router);