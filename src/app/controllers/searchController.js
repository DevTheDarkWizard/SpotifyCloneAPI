const express = require("express");

const Song = require("../models/song");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/multi", async (req, res) => {
	try {
		const { search_type, query } = req.query;

		if(!query && query.length == 0) {
			return res.status(200).json({ tracks: [] });
		}
		
		const songs = await Song.find({ 
			$or: [
				{"title": { "$regex": query, "$options": "i" }},
				{"subtitle": { "$regex": query, "$options": "i" }},
				{ "genres.primary": { "$regex" : query, "$options": "i" } }
			]
		});

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

module.exports = (app) => app.use("/search", router);