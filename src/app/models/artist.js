const mongoose = require("../../database");

const ArtistScheme = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
	genreNames: {
		type: Array,
		default: []
	},
	artwork: {
		width: Number,
		height: Number,
		url: String
	},
	relationships: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Album"
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

const Artist = new mongoose.model("Artist", ArtistScheme);

module.exports = Artist;

/*
{
	"data": [
	  {
		"id": "112058",
		"type": "artists",
		"attributes": {
		  "genreNames": [
			"Hip-Hop/Rap"
		  ],
		  "name": "50 Cent",
		  "editorialNotes": {
			"short": "Ebro chats with 50 Cent about his new book, Hustle Harder, Hustle Smarter.",
			"tagline": "Listen Now"
		  },
		  "artwork": {
			"width": 2400,
			"url": "https://is3-ssl.mzstatic.com/image/thumb/Features115/v4/e0/40/f8/e040f81e-0778-2221-ba15-33fca4ff3827/mzl.okdyshbj.jpg/{w}x{h}bb.jpg",
			"height": 2400,
			"textColor3": "c4cbcb",
			"textColor2": "9eb6d2",
			"textColor4": "7e92a7",
			"textColor1": "f6ffff",
			"bgColor": "000000",
			"hasP3": false
		  },
		  "url": "https://music.apple.com/us/artist/50-cent/112058"
		},
		"relationships": {
		  "albums": {
			"data": [
			  {
				"id": "1440841450",
				"type": "albums"
			  },
			  {
				"id": "1440767663",
				"type": "albums"
			  },
			  {
				"id": "1440761298",
				"type": "albums"
			  },
			  {
				"id": "1440879586",
				"type": "albums"
			  },
			  {
				"id": "1440907378",
				"type": "albums"
			  },
			  {
				"id": "1320327369",
				"type": "albums"
			  },
			  {
				"id": "379891919",
				"type": "albums"
			  },
			  {
				"id": "1445316124",
				"type": "albums"
			  },
			  {
				"id": "1443237261",
				"type": "albums"
			  },
			  {
				"id": "1444007100",
				"type": "albums"
			  },
			  {
				"id": "1444149872",
				"type": "albums"
			  },
			  {
				"id": "1440877068",
				"type": "albums"
			  },
			  {
				"id": "1434124940",
				"type": "albums"
			  },
			  {
				"id": "1445141764",
				"type": "albums"
			  },
			  {
				"id": "1546650912",
				"type": "albums"
			  },
			  {
				"id": "1604605592",
				"type": "albums"
			  },
			  {
				"id": "1443746079",
				"type": "albums"
			  },
			  {
				"id": "1369411272",
				"type": "albums"
			  },
			  {
				"id": "1314762325",
				"type": "albums"
			  },
			  {
				"id": "1553376181",
				"type": "albums"
			  },
			  {
				"id": "1445282436",
				"type": "albums"
			  },
			  {
				"id": "1444289378",
				"type": "albums"
			  },
			  {
				"id": "1160921374",
				"type": "albums"
			  },
			  {
				"id": "1444866555",
				"type": "albums"
			  },
			  {
				"id": "1445281278",
				"type": "albums"
			  }
			]
		  }
		}
	  }
	]
  }
*/