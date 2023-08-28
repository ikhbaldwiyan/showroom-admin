const express = require('express');
const router = express.Router();
const setlistController = require('../controller/setlistController');

router.get('/', setlistController.listSetlists);
router.post('/', setlistController.addSetlist);
router.put('/:id', setlistController.updateSetlist);
router.delete('/:id', setlistController.deleteSetlist);
router.get("/setlists/:id", setlistController.detailSetlist);

module.exports = router;
