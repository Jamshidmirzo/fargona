const express = require('express');
const router = express.Router();
const museumController = require('../controllers/museumController');

router.get('/', museumController.getAllMuseums);
router.post('/', museumController.createMuseum);
router.post('/quiz-stats', museumController.createQuizStat);
router.get('/quiz-stats/all', museumController.getQuizStats);
router.get('/:id', museumController.getMuseumById);
router.put('/:id', museumController.updateMuseum);
router.delete('/:id', museumController.deleteMuseum);
router.get('/:id/quiz', museumController.getMuseumQuiz);
router.post('/:id/quizzes', museumController.createQuizQuestion);
router.delete('/:id/quizzes/:quizId', museumController.deleteQuizQuestion);
router.post('/:id/exhibits', museumController.createExhibit);
router.put('/:id/exhibits/:exhibitId', museumController.updateExhibit);
router.delete('/:id/exhibits/:exhibitId', museumController.deleteExhibit);

module.exports = router;
