const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', () => { return "It's bot service!"});

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 8, max: 32 }),
    userController.registration
);

//Client router
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/users', authMiddleware, userController.getUsers);
router.get('/confirmLetter', authMiddleware, userController.getEmailConfirmLetter);

router.post('/apilist', authMiddleware, userController.getApiList);
router.post('/addApi', authMiddleware, userController.addApi);
router.post('/checkApi', authMiddleware, userController.checkApi);
router.post('/deleteApi', authMiddleware, userController.deleteApi);

router.get('/getBots', authMiddleware, userController.getBots);
router.post('/createBot', authMiddleware, userController.createBot);
router.post('/deleteBot', authMiddleware, userController.deleteBot);
router.post('/startBot', authMiddleware, userController.startBot);
router.post('/stopBot', authMiddleware, userController.stopBot);
router.get('/stopAllBots', authMiddleware, userController.stopAllBots);

router.get('/getBlackList', authMiddleware, userController.getBlackList);
router.put('/setBlackList', authMiddleware, userController.setBlackList);
router.get('/getSettings', authMiddleware, userController.getSettings);
router.put('/setBotSettings', authMiddleware, userController.setBotSettings);

//Bot service router
router.post('/botInfoUpdate', userController.botInfoUpdate);

module.exports = router;