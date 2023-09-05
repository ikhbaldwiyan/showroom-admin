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
    const { name, description, criteria, reward, type, exp } = req.body;
    const newTask = new Task({
      name,
      description,
      criteria,
      reward,
      type,
      exp,
    });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while creating a task." });
  }
};

exports.detailTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    const users = await User.find(
      { "progressData.taskProgress.taskId": taskId },
      "user_id name progressData.taskProgress"
    );

    const listUsers = users.map((user) => ({
      name: user.name,
      user_id: user.user_id,
      taskProgress: user.progressData.taskProgress
        .filter((task) => task.taskId.toString() === taskId.toString())
        .map((task) => ({
          progress: task.progress,
          status: task.status,
        })),
    }));

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ task, listUsers });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { name, description, criteria, reward, type, exp } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        name,
        description,
        criteria,
        reward,
        type,
        exp,
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
    const { userId, progress, liveId } = req.body;
    const taskId = req.params.taskId;
    const user = await User.findById(userId);
    const task = await Task.findOne({ _id: taskId });

    const taskProgress = user.progressData.taskProgress.find(
      (task) => task.taskId.toString() === taskId
    );

    if (taskProgress) {
      if (progress > task.criteria) {
        taskProgress.progress = task.criteria;
      } else {
        taskProgress.progress = progress;
      }

      if (task.type === "watch" && liveId !== null && liveId !== undefined) {
        if (!taskProgress.liveIds.includes(liveId)) {
          taskProgress.liveIds.push(liveId);
        }
      }
    } else {
      const newTaskProgress = {
        taskId,
        progress: Math.min(progress, task.criteria),
        liveIds: [],
      };

      if (task.type === "watch" && liveId !== null && liveId !== undefined) {
        newTaskProgress.liveIds.push(liveId);
      }
      user.progressData.taskProgress.push(newTaskProgress);
    }

    await user.save();

    const updatedTaskProgress = {
      taskId: taskProgress.taskId,
      progress: taskProgress.progress,
      status: taskProgress.status,
      liveIds: taskProgress.liveIds || [], // Include liveIds if defined, or an empty array
    };

    res.json({
      message: "Task progress updated successfully",
      task: task,
      taskProgress: updatedTaskProgress,
    });
  } catch (error) {
    console.error("Error updating task progress:", error);
    res.status(500).json({ message: "Task progress failed to update" });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { userId, progressId } = req.body;
    const user = await User.findById(userId);
    const task = await Task.findById(taskId);

    // Find the taskProgress entry for the specified task
    const taskProgressIndex = user.progressData.taskProgress.findIndex(
      (taskProgress) => {
        return taskProgress._id.toString() === progressId.toString();
      }
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
        // Calculate experience points earned from the task
        const expEarned = task.exp || 0; // Use the "exp" value from the task, default to 0 if not present

        await User.updateOne(
          { _id: userId },
          {
            $push: { "progressData.completedTasks": taskId },
            $inc: { points: task.reward, experience: expEarned }, // Increment user's points and experience
            $set: {
              [`progressData.taskProgress.${taskProgressIndex}.status`]:
                "completed",
            }, // Update status to "completed"
          }
        );

        const levelThresholds = [
          { level: 1, experienceRequired: 300 },
          { level: 2, experienceRequired: 800 },
          { level: 3, experienceRequired: 1600 },
          { level: 4, experienceRequired: 2400 },
          { level: 5, experienceRequired: 3600 },
          { level: 6, experienceRequired: 4500 },
          { level: 7, experienceRequired: 6000 },
        ];

        // Calculate the user's level based on experience points
        const currentLevel = user.level || 1; // Default to level 1 if not set
        let newLevel = currentLevel;
        for (const levelInfo of levelThresholds) {
          if (user.experience >= levelInfo.experienceRequired) {
            newLevel = levelInfo.level;
          } else {
            break; // Break the loop as soon as the user doesn't meet the level requirement
          }
        }

        if (newLevel > currentLevel && currentLevel !== newLevel) {
          // User leveled up
          await User.updateOne({ _id: userId }, { $set: { level: newLevel } });

          return res.json({
            message: `Congrats! Task completed. You earned ${
              task.reward
            } Points, and leveled up to ${
              levelThresholds[newLevel - 1].level
            }`,
            task: {
              name: task.name,
              description: task.description,
              points: task.reward,
              experience: expEarned,
            },
            currentExp: user.experience,
            newLevel: levelThresholds[newLevel - 1].level,
          });
        }

        return res.json({
          message: `Congrats! Task completed. You earned ${task.reward} Points`,
          task: {
            name: task.name,
            description: task.description,
            points: task.reward,
            experience: expEarned,
          },
          currentExp: user.experience,
          currentLevel,
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
            description: task.description,
          },
          current_progress:
            user.progressData.taskProgress[taskProgressIndex].progress,
          criteria: task.criteria,
          points: task.reward,
          experience: task.exp,
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
