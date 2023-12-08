// controllers/setlistController.js
const { Setlist, Songs } = require("../models/Setlist");

// Create List Setlist endpoint
exports.listSetlists = async (req, res) => {
  try {
    const setlists = await Setlist.find().populate('songs');
    res.json(setlists);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create Add setlist endpoint
exports.addSetlist = async (req, res) => {
  try {
    const { name, description, originalName, songs, image } = req.body;

    // Create multiple songs
    const listSongs = await Songs.insertMany(songs)

    const setlist = await Setlist.create({
      name,
      originalName,
      description,
      songs: listSongs.map(song => song['_id'].toString()),
      image,
    })

    res.status(201).json(setlist);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Bad Request" });
  }
};

// Create Update setlist endpoint
exports.updateSetlist = async (req, res) => {
  try {
    const { name, description, originalName, songs, image } = req.body;

    songs.map( async item => {
      if(item._id){
        await Songs.findOneAndUpdate({_id: item._id}, item)
      } else {
        let newSong = await Songs.create(item)

        await Setlist.findOneAndUpdate({_id: req.params.id}, {
          $push: { songs: newSong._id }
        })
      }
    })

    const updatedSetlist = await Setlist.findByIdAndUpdate(
      req.params.id,
      {
        name,
        originalName,
        description,
        image,
      },
      { new: true }
    );
    res.json(updatedSetlist);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Bad Request" });
  }
};

// Create Delete setlist endpoint
exports.deleteSetlist = async (req, res) => {
  try {
    const { id } = req.params
    let setlistDetail = await Setlist.findOne({_id: id})

    await Songs.deleteMany({_id: {$in: setlistDetail.songs}})

    await Setlist.findByIdAndRemove(id);
    res.json({ message: `Setlist with id ${id} deleted successfully` });
  } catch (err) {
    res.status(400).json({ error: "Bad Request" });
  }
};

exports.detailSetlist = async (req, res) => {
  try {
    const setlist = await Setlist.findById(req.params.id).populate('songs');
    if (!setlist) {
      return res.status(404).json({ error: "Setlist not found" });
    }
    res.json(setlist);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};