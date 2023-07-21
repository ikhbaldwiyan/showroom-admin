// controllers/setlistController.js
const Setlist = require("../models/Setlist");

// Create List Setlist endpoint
exports.listSetlists = async (req, res) => {
  try {
    const setlists = await Setlist.find();
    res.json(setlists);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create Add setlist endpoint
exports.addSetlist = async (req, res) => {
  try {
    const { name, description, originalName, songs, image } = req.body;
    const setlist = new Setlist({
      name,
      originalName,
      description,
      songs,
      image,
    });
    await setlist.save();
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
    const updatedSetlist = await Setlist.findByIdAndUpdate(
      req.params.id,
      { name, originalName, description, songs, image },
      { new: true }
    );
    res.json(updatedSetlist);
  } catch (err) {
    res.status(400).json({ error: "Bad Request" });
  }
};

// Create Delete setlist endpoint
exports.deleteSetlist = async (req, res) => {
  try {
    await Setlist.findByIdAndRemove(req.params.id);
    res.json({ message: "Setlist deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Bad Request" });
  }
};
