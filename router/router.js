const Router = require('koa-router');
const router = new Router();
const authenticated = require('./../middleware/authenticated');

const auth = require('./../controllers/auth');
const dashboard = require('./../controllers/dashboard');

router.post('/register', auth.register);
router.post('/login', auth.login);

router.get('/banana', authenticated, dashboard.summary);

module.exports = router;
