const express = require("express");

const mongoose = require("mongoose");
const Artist = require("../models/artist");
const Song = require("../models/song");

const authMiddleware = require("../middlewares/auth");
const privilegeMiddleware = require("../middlewares/privilege");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
	try {
		const artists = await Artist.find().populate(["relationships"]);
		
		const result = artists.map(artist => {
			const { id, name, genreNames, artwork, relationship } = artist;
			return { id, attributes:{ genreNames, name, artwork }, relationship }
		});

		return res.status(200).json({ data: result });
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.get("/get-details", async (req, res) => {
	try {
		const artistId = req.query.id;

		if(!mongoose.Types.ObjectId.isValid(artistId)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const artist = await Artist.findById(artistId).populate(["relationships"]);
		
		if(!artist) {
			return res.status(404).json({ error: "Artist not found!" });
		}

		const { id, name, genreNames, artwork, relationship } = artist;

		return res.status(200).json({ data: [ {
			id,
			attributes: {
				genreNames,
				name,
				artwork,
			},
			relationship
		} ] });
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.get("/get-top-songs", async (req, res) => {
	try {
		const artistId = req.query.id;

		if(!mongoose.Types.ObjectId.isValid(artistId)) {
			return res.status(400).json({ error: "Invalid id" });
		}

		const songs = await Song.find({ artists: { $elemMatch: { adamid: artistId } } }).sort({ _id: -1 }).limit(10);

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

router.post("/", privilegeMiddleware, async (req,res) => {
	try {
		const { name } = req.body;

		if(await Artist.findOne({ name }))
			return res.status(400).json({ error: "Artist already exists!"});
		
		const artist = await Artist.create(req.body);

		artist.createdAt = undefined;
		artist.updatedAt = undefined;
		artist.__v = undefined;

		const { id, genreNames, artwork, relationship } = artist;

		return res.status(200).json({
			id,
			attributes: {
				genreNames,
				name,
				artwork,
			},
			relationship
		});
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.put("/:artistId", privilegeMiddleware, async (req, res) => {
	try {
		const { artistId } = req.params;

		const artist = await Artist.findByIdAndUpdate(artistId, req.body, { new: true });

		if(!artist) {
			return res.status(404).json({ error: "Artist not found" });
		}

		const songs = await Song.find({ artists: { $elemMatch: { adamid: artist.id } }, subtitle: { $ne: artist.name } });

		if(songs && songs.length) {
			await Promise.all(
				songs.map(async song => {
					song.subtitle = artist.name;
					await song.save();
				})
			);
		}

		const { id, name, genreNames, artwork, relationship } = artist;

		return res.status(200).send({
			id,
			attributes: {
				genreNames,
				name,
				artwork,
			},
			relationship
		});
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

router.delete("/:artistId", privilegeMiddleware, async (req, res) => {
	try {
		const { artistId } = req.params;
		const artist = await Artist.findById(artistId);

		if(!artist) {
			return response.status(404).json({ error: "Artist not found" });
		}

		await Song.deleteMany({ artists: { $elemMatch: { adamid: artist.id } } });

		await Artist.findByIdAndRemove(artistId);

		return res.status(200).send();
	} catch(err) {
		return res.status(500).json({ error: err.message || "Unexpected error" });
	}
});

module.exports = (app) => app.use("/artists", router);