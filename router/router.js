const Router = require('koa-router');
const router = new Router();
const authenticated = require('./../middleware/authenticated');

const auth = require('./../controllers/auth');
const dashboard = require('./../controllers/dashboard');
const exercises = require('./../controllers/exercises');
const applications = require('./../controllers/applications');

// AUTH ROUTES
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/confirmEmail', auth.confirmEmail);

// DASHOBARD ROUTES
router.get('/banana', authenticated, dashboard.summary);

// INTERVIEWERS ROUTES

// EXERCISES ROUTES
router.post('/createExercise', authenticated, exercises.createExercise);
router.get('/getExercises', authenticated, exercises.getExercises);
router.delete('/deleteExercise/:id', authenticated, exercises.deleteExercise);

// APPLICATIONS ROUTES
router.get('/getApplications', authenticated, applications.getApplications);
router.post('/createApplication', authenticated, applications.createApplication);
router.get('/getApplication/:id', applications.getApplication);
router.post('/startApplication/:id', applications.startApplication);


module.exports = router;
