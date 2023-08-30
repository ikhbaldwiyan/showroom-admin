// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get("/:id", taskController.detailTask);
router.put('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);
router.put('/toggle/:taskId', taskController.toggleTaskStatus);
router.put('/update-progress/:taskId', taskController.updateTaskProgress);
router.put('/complete-task/:taskId', taskController.completeTask);

module.exports = router;
