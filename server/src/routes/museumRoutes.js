const express = require('express');
const router = express.Router();
const museumController = require('../controllers/museumController');
const { verifyToken, checkMuseumAccess } = require('../middleware/authMiddleware');

router.get('/', museumController.getAllMuseums);
router.post('/', verifyToken, museumController.createMuseum);
router.post('/quiz-stats', museumController.createQuizStat);
router.get('/quiz-stats/all', museumController.getQuizStats);
router.get('/site-translations', museumController.getSiteTranslations);
router.put('/site-translations', verifyToken, museumController.updateSiteTranslations);
router.get('/all-news', museumController.getAllNews);
router.get('/all-events', museumController.getAllEvents);
router.get('/news/:newsId', museumController.getNewsById);
router.get('/events/:eventId', museumController.getEventById);
router.post('/visits', museumController.recordVisit);
router.get('/visits/stats', museumController.getVisitStats);
router.get('/:id', museumController.getMuseumById);
router.put('/:id', verifyToken, checkMuseumAccess, museumController.updateMuseum);
router.delete('/:id', verifyToken, museumController.deleteMuseum);
router.get('/:id/quiz', museumController.getMuseumQuiz);
router.post('/:id/quizzes', verifyToken, checkMuseumAccess, museumController.createQuizQuestion);
router.delete('/:id/quizzes/:quizId', verifyToken, checkMuseumAccess, museumController.deleteQuizQuestion);
router.post('/:id/exhibits', verifyToken, checkMuseumAccess, museumController.createExhibit);
router.put('/:id/exhibits/:exhibitId', verifyToken, checkMuseumAccess, museumController.updateExhibit);
router.delete('/:id/exhibits/:exhibitId', verifyToken, checkMuseumAccess, museumController.deleteExhibit);

// News routes
router.get('/:id/news', museumController.getMuseumNews);
router.post('/:id/news', verifyToken, checkMuseumAccess, museumController.createMuseumNews);
router.delete('/:id/news/:newsId', verifyToken, checkMuseumAccess, museumController.deleteMuseumNews);

// Events routes
router.get('/:id/events', museumController.getMuseumEvents);
router.post('/:id/events', verifyToken, checkMuseumAccess, museumController.createMuseumEvent);
router.delete('/:id/events/:eventId', verifyToken, checkMuseumAccess, museumController.deleteMuseumEvent);

module.exports = router;
