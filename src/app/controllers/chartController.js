const express = require("express");

//const Artist = require("../models/artist");
const Song = require("../models/song");

const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/track", async (req, res) => {
	try {
		const songsGroup = await Song.aggregate([
		{
			$group: {
				_id: "$artists",
				tracks: { $push: "$$ROOT" }
			}
		},
		{ $sort: { _id: -1 } },
		{ $limit: 10 },
		]);

		const songs = songsGroup.map(song => {
			var newSong = song.tracks[0];
			newSong.key = newSong._id;
			newSong._id = undefined;
			newSong.createdAt = undefined;
			newSong.updatedAt = undefined;
			newSong.__v = undefined;
			return newSong;
		});

		return res.status(200).json({ tracks: songs });
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.get("/country", async (req, res) => {
	try {
		const countryCode = req.query.country_code;

		const songs = await Song.find(
			{ country: { "$regex" : countryCode, "$options": "i" } }
		).sort({ _id: -1 }).limit(20);

		const newSongs = songs.map(song => {
			var newSong = song.toObject();
			newSong.key = newSong._id;
			newSong._id = undefined;
			return newSong;
		});

		return res.status(200).json({ tracks: newSongs });
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.get("/genre-world", async (req, res) => {
	try {
		const genreCode = req.query.genre_code;

		if(!genreCode && genreCode.length == 0) {
			return res.status(200).json({ tracks: [] });
		}

		/*const artists = await Artist.find(
			{ genreNames: { "$regex" : genreCode, "$options": "i" } }
		).sort({ _id: -1 }).limit(20);

		let songs = [];

		await Promise.all(
			artists.map(async artist => {
				const song = await Song.findOne({ artists: { $elemMatch: { adamid: artist.id } } });
				if(song) songs.push(song);
			})
		);*/

		const songs = await Song.find(
			{ "genres.primary": { "$regex" : genreCode, "$options": "i" } }
		).sort({ _id: -1 }).limit(20);

		const newSongs = songs.map(song => {
			var newSong = song.toObject();
			newSong.key = newSong._id;
			newSong._id = undefined;
			return newSong;
		});

		return res.status(200).json({ tracks: newSongs });
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

module.exports = (app) => app.use("/charts", router);