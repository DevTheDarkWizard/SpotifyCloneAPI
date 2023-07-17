const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	passwordResetToken: {
		type: String,
		select: false
	},
	passwordResetExpire: {
		type: Date,
		select: false
	},
	privilege: {
		type: Number,
		default: 0,
		select: false
	},
	createdAt: {
		type: Date,
		select: false
	},
	updatedAt: {
		type: Date,
		select: false
	},
	__v: {
		type: Number,
		select: false
	}
},
{
	timestamps: true
});

UserSchema.pre("save", async function(next) {
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;
	next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;