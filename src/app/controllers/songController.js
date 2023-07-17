const express = require("express");

const mongoose = require("mongoose");
const Song = require("../models/song");

const authMiddleware = require("../middlewares/auth");
const privilegeMiddleware = require("../middlewares/privilege");

const { response } = require("express");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
	try {
		return res.status(501).json();
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.get("/get-details", async (req, res) => {
	try {
		const songId = req.query.key;

		if(!mongoose.Types.ObjectId.isValid(songId)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const song = await Song.findById(songId);
		
		if(!song) {
			return res.status(404).json({ error: "Song not found!" });
		}

		var newSong = song.toObject();
		newSong.key = newSong._id;
		newSong._id = undefined;

		return res.status(200).json(newSong);
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.post("/", privilegeMiddleware, async (req,res) => {
	try {
		const { title, subtitle } = req.body;

		const exists = await Song.findOne({ title });
		if(exists && exists.subtitle == subtitle)
			return res.status(400).json({ error: "Song already exists!"});
		
		const song = await Song.create(req.body);

		song.createdAt = undefined;
		song.updatedAt = undefined;
		song.__v = undefined;

		var newSong = song.toObject();
		newSong.key = newSong._id;
		newSong._id = undefined;

		return res.status(200).json(newSong);
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.put("/:songId", privilegeMiddleware, async (req, res) => {
	try {
		const { songId } = req.params;
		const { title, subtitle } = req.body;

		const checkExist = await Song.findOne({ title, subtitle });

		if(checkExist && checkExist.id != songId) {
			return res.status(409).json({ error: "The artist already have this song registered!" });
		}

		const song = await Song.findByIdAndUpdate(songId, req.body, { new: true });

		if(!song) {
			return res.status(404).json({ error: "Song not found" });
		}

		var newSong = song.toObject();
		newSong.key = newSong._id;
		newSong._id = undefined;

		return res.status(200).send(newSong);
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.delete("/:songId", privilegeMiddleware, async (req, res) => {
	try {
		const { songId } = req.params;
		const song = await Song.findById(songId);

		if(!song) {
			return response.status(404).json({ error: "Song not found" });
		}

		await Song.findByIdAndRemove(songId);

		return res.status(200).send();
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

module.exports = (app) => app.use("/songs", router);