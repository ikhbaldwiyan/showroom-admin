const Member = require("../models/Member");

exports.getAllMembers = async (req, res) => {
  try {
    const type = req.query.type; // Member type filter
    const showAll = req.query.showAll === "true"; // Check if showAll parameter is true

    let members;
    let count;

    if (showAll) {
      // Fetch all members of the specified type
      members = await Member.find({ type });
      count = members.length;
    } else {
      // Apply pagination for the specified type
      const page = parseInt(req.query.page) || 1; // Current page number, default is 1
      const limit = 10; // Number of members per page

      const filter = type ? { type } : {}; // Create filter object

      count = await Member.countDocuments(filter); // Total number of members matching the filter
      const totalPages = Math.ceil(count / limit); // Total number of pages

      const skip = (page - 1) * limit; // Number of members to skip

      members = await Member.find(filter).skip(skip).limit(limit); // Fetch members for the current page
    }

    res.json({
      members,
      currentPage: 1,
      totalPages: 1,
      totalMembers: count,
    });
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
    const { name, stage_name, type } = req.body;

    const image = await uploadImage(req.file, 'member')

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { name, stage_name, type, image: image?.image?.url  },
      { new: true }
    );
    if (!updatedMember) return res.status(404).send("Member not found.");
    res.json(updatedMember);
  } catch (error) {
    console.log('error', error)
    res.status(400).send({
      success: false, 
      message: error.message
    });
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
