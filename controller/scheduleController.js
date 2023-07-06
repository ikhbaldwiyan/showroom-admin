const Schedule = require("../models/Schedule");

// GET all theater schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// GET a specific theater schedule
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
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
      birthdayMemberName,
      isOnWeekSchedule,
      setlist,
      memberList,
    } = req.body;
    const newSchedule = new Schedule({
      showDate,
      showTime,
      isBirthdayShow,
      birthdayMemberName,
      isOnWeekSchedule,
      setlist,
      memberList,
    });
    const createdSchedule = await newSchedule.save();
    res.json(createdSchedule);
  } catch (error) {
    res.status(500).send("Internal Server Error");
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
      birthdayMemberName,
      isOnWeekSchedule,
    } = req.body;
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        showDate,
        showTime,
        isBirthdayShow,
        setlist,
        memberList,
        birthdayMemberName,
        isOnWeekSchedule,
      },
      { new: true }
    );
    if (!updatedSchedule) return res.status(404).send("Schedule not found.");
    res.json(updatedSchedule);
  } catch (error) {
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
