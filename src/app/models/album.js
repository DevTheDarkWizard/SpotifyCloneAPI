const mongoose = require("../../database");

// Not Implemented

const AlbumSchema = new mongoose.Schema({
	artists: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Artist"
	},
	songs: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Song"
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

const Album = new mongoose.model("Album", AlbumSchema);

module.exports = Album;