const express = require('express');
const router = express.Router();
const museumController = require('../controllers/museumController');

router.get('/', museumController.getAllMuseums);
router.post('/', museumController.createMuseum);
router.get('/:id', museumController.getMuseumById);
router.put('/:id', museumController.updateMuseum);
router.get('/:id/quiz', museumController.getMuseumQuiz);

module.exports = router;
