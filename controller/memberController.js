const Member = require("../models/Member");

// GET all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// GET a specific member
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).send("Member not found.");
    res.json(member);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// POST a new member
exports.createMember = async (req, res) => {
  try {
    const { name, stage_name, type, image } = req.body;
    const newMember = new Member({ name, stage_name, type, image });
    const createdMember = await newMember.save();
    res.json(createdMember);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// PUT (update) an existing member
exports.updateMember = async (req, res) => {
  try {
    const { name, stage_name, type, image } = req.body;
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { name, stage_name, type, image },
      { new: true }
    );
    if (!updatedMember) return res.status(404).send("Member not found.");
    res.json(updatedMember);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// DELETE a member
exports.deleteMember = async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndRemove(req.params.id);
    if (!deletedMember) return res.status(404).send("Member not found.");
    res.send("Member deleted successfully.");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
