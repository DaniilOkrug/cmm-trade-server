const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api.error');
const userService = require('../service/user.service');
const botService = require('../service/bot.service');
const userBotService = require('../service/userBot.service');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
            }

            const { email, password } = req.body;
            const userData = await userService.registration(email, password);

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);

            return res.redirect('https://ya.ru/');
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();

            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getSettings(req, res, next) {
        try {
            const settings = await userService.getSettings();

            return res.json(settings);
        } catch (e) {
            next(e);
        }
    }

    async getBots(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const botsList = await userBotService.getBots(refreshToken);

            return res.json(botsList);
        } catch (e) {
            next(e);
        }
    }


    async getApiList(req, res, next) {
        try {
            const { userId } = req.body;
            const apiList = await userService.getApiList(userId);

            return res.json(apiList);
        } catch (e) {
            next(e);
        }
    }

    async addApi(req, res, next) {
        try {
            const { key, secret, name, exchange } = req.body;
            const { refreshToken } = req.cookies;

            const apiList = await userService.addApi(key, secret, name, exchange, refreshToken);

            return res.json(apiList);
        } catch (e) {
            next(e);
        }
    }

    async deleteApi(req, res, next) {
        try {
            const { key } = req.body;
            const { refreshToken } = req.cookies;

            const apiList = await userService.deleteApi(key, refreshToken);

            return res.json(apiList);
        } catch (e) {
            next(e);
        }
    }

    async checkApi(req, res, next) {
        try {
            const { key } = req.body;
            const { refreshToken } = req.cookies;

            const apiList = await userService.checkApi(key, refreshToken);

            return res.json(apiList);
        } catch (e) {
            next(e);
        }
    }

    async createBot(req, res, next) {
        try {
            const { name, apiKey, deposit } = req.body;
            const { refreshToken } = req.cookies;

            const userBot = await userService.createBot(name, apiKey, deposit, refreshToken);

            return res.json(userBot);
        } catch (e) {
            next(e);
        }
    }

    async deleteBot(req, res, next) {
        try {
            const { name } = req.body;
            const { refreshToken } = req.cookies;

            const botList = await userService.deleteBot(name, refreshToken);

            return res.json(botList);
        } catch (e) {
            next(e);
        }
    }

    async startBot(req, res, next) {
        try {
            const { name } = req.body;
            const { refreshToken } = req.cookies;

            const botList = await userService.startBot(name, refreshToken);

            return res.json(botList);
        } catch (e) {
            next(e);
        }
    }

    async stopBot(req, res, next) {
        try {
            const { name } = req.body;
            const { refreshToken } = req.cookies;   

            const botList = await userService.stopBot(name, refreshToken);

            return res.json(botList);
        } catch (e) {
            next(e);
        }
    }

    async stopAllBots(req, res, next) {
        try {
            const { refreshToken } = req.cookies;

            const response = await userService.stopAllBots(refreshToken);

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async botInfoUpdate(req, res, next) {
        try {
            const { botId, status } = req.body;

            const updateBot = await userBotService.botInfoUpdate(botId, status);

            return res.json(updateBot);
        } catch (e) {
            next(e);
        }
    }

    async setBotSettings(req, res, next) {
        try {
            const botData = req.body;

            const pairs = botData.pairs;
            const settings = botData;
            delete settings.pairs;

            const newBotSettings = await botService.setBotSettigns(pairs, settings);

            return res.json(newBotSettings);
        } catch (e) {
            next(e);
        }
    }

    async getBlackList(req, res, next) {
        try {
            const blackList = await botService.getBlackList();

            return res.json(blackList);
        } catch (e) {
            next(e);
        }
    }

    async setBlackList(req, res, next) {
        try {
            const { blacklist } = req.body;
            const newBlackList = await botService.setBlackList(blacklist);

            return res.json(newBlackList);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();