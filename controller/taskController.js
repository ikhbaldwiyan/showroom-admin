const Task = require("../models/Task");
const User = require("../models/User");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching tasks." });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { name, description, criteria, reward, type } = req.body;
    const newTask = new Task({ name, description, criteria, reward, type });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while creating a task." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { name, description, criteria, reward, type } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        name,
        description,
        criteria,
        reward,
        type,
      },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating a task." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting a task." });
  }
};

exports.toggleTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);
    task.active = !task.active;
    await task.save();
    res.json(task);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while toggling task status." });
  }
};

exports.updateTaskProgress = async (req, res) => {
  try {
    const { userId, progress } = req.body;
    const taskId = req.params.taskId;
    const user = await User.findById(userId);

    const taskProgress = user.progressData.taskProgress.find(
      (task) => task.taskId.toString() === taskId
    );

    if (taskProgress) {
      taskProgress.progress = progress;
    } else {
      user.progressData.taskProgress.push({ taskId, progress });
    }

    await user.save();
    res.json({ message: "Task progress updated successfully" });
  } catch (error) {
    console.error("Error updating task progress:", error);
    res.status(500).json({ message: "Task progress failed to update" });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.body.userId;
    const user = await User.findById(userId);
    const task = await Task.findById(taskId);

    // Find the taskProgress entry for the specified task
    const taskProgressIndex = user.progressData.taskProgress.findIndex(
      (taskProgress) => taskProgress.taskId.toString() === taskId
    );

    // If taskProgress entry is found and task criteria are met
    if (
      taskProgressIndex !== -1 &&
      !user.progressData.completedTasks.includes(taskId)
    ) {
      // Check if the task is now complete
      if (
        user.progressData.taskProgress[taskProgressIndex].progress >=
        task.criteria
      ) {

        await User.updateOne(
          { _id: userId },
          {
            $push: { "progressData.completedTasks": taskId },
            $inc: { points: task.reward }, // Increment user's points by task reward
            $set: { [`progressData.taskProgress.${taskProgressIndex}.status`]: 'completed' } // Update status to "completed"
          }
        );
        return res.json({
          message: `Congrats task completed you get ${task.reward} Points `,
          task: {
            name: task.name,
            description: task.description
          },
          points: task.reward
        });
      }

      if (
        user.progressData.taskProgress[taskProgressIndex].progress <=
        task.criteria
      ) {
        return res.json({
          message: "Please complete the task to required criteria",
          task: {
            name: task.name,
            description: task.description
          },
          current_progress:
            user.progressData.taskProgress[taskProgressIndex].progress,
          criteria: task.criteria,
          points: task.reward
        });
      }

      await user.save();
    }

    return res.json({ message: "Task already completed and claimed" });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};


