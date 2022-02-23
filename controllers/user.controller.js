const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api.error');
const userService = require('../service/user.service');
const botService = require('../service/bot.service');

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

    async addApi(req, res, next) {
        try {
            const { key, secret, name, exchange } = req.body;
            const { refreshToken } = req.cookies;

            const response = await userService.addApi(key, secret, name, exchange, refreshToken);

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async createBot(req, res, next) {
        try {
            const { pair, apiKey, deposit } = req.body;
            const { refreshToken } = req.cookies;

            const userBot = await userService.createBot(pair, apiKey, deposit, refreshToken);

            return res.json(userBot);
        } catch (e) {
            next(e);
        }
    }

    async setBotSettings(req, res, next) {
        try {
            const { pairs, settings } = req.body;

            const response = await botService.setBotSettigns(pairs, settings);

            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();