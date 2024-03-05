const express = require('express');
const memberController = require('../controller/memberController');

const upload = require('../utils/multer')

const router = express.Router();

router.get('/', memberController.getAllMembers);
router.post('/', upload.single('image'), memberController.createMember);
router.get('/:id', memberController.getMemberById);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;
