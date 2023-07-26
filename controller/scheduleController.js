const Schedule = require("../models/Schedule");

// GET all theater schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('memberList').populate('setlist');
    res.json(schedules);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// GET a specific theater schedule
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate("memberList").populate('setlist');
    if (!schedule) return res.status(404).send("Schedule not found.");
    res.json(schedule);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// POST a new theater schedule
exports.createSchedule = async (req, res) => {
  try {
    const {
      showDate,
      showTime,
      isBirthdayShow,
      birthdayMember,
      isOnWeekSchedule,
      setlist,
      memberList,
      ticketShowroom,
      ticketTheater,
      webImage,
    } = req.body;

    const memberIds = memberList.map((member) => member);

    const newSchedule = new Schedule({
      showDate,
      showTime,
      setlist,
      isBirthdayShow,
      birthdayMember,
      isOnWeekSchedule,
      memberList: memberIds,
      ticketShowroom,
      ticketTheater,
      webImage,
    });
    const createdSchedule = await newSchedule.save();

    res.json(createdSchedule);
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      res.status(400).json({ errors });
    } else {
      // Other unexpected errors
      console.log(error);
      res.status(500).send({
        message: 'Internal server error.',
      });
    }
  }
};

// PUT (update) an existing theater schedule
exports.updateSchedule = async (req, res) => {
  try {
    const {
      showDate,
      showTime,
      isBirthdayShow,
      setlist,
      memberList,
      birthdayMember,
      isOnWeekSchedule,
      ticketShowroom,
      ticketTheater,
      webImage,
    } = req.body;

    const memberIds = memberList?.map((member) => member);
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        showDate,
        showTime,
        isBirthdayShow,
        setlist,
        birthdayMember,
        isOnWeekSchedule,
        memberList: memberIds,
        ticketShowroom,
        ticketTheater,
        webImage,
      },
      { new: true }
    );
    
    if (!updatedSchedule) return res.status(404).send("Schedule not found.");
    res.json(updatedSchedule);
  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error");
  }
};

// DELETE a theater schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndRemove(req.params.id);
    if (!deletedSchedule) return res.status(404).send("Schedule not found.");
    res.send("Schedule deleted successfully.");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
