const UserModel = require("../models/user.model");
const ApiModel = require("../models/api.model");
const UserBotModel = require("../models/userBot.model");
const BotModel = require("../models/bot.model");

const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require("./mail.service");
const tokenService = require("./token.service");
const UserDto = require("../dtos/user.dto");
const ApiError = require('../exceptions/api.error');
const req = require("express/lib/request");

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email });

        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();

        const user = await UserModel.create({ email, password: hashPassword, activationLink });
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });

        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации');
        }

        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден');
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async addApi(key, secret, name, exchange, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const apiArray = await ApiModel.find({ key, secret });

        if (apiArray.length != 0) {
            throw ApiError.Conflict('API ключи уже существую');
        }

        await ApiModel.create({
            user: userData.id,
            key,
            secret,
            name,
            exchange
        });

        return {
            message: "Created"
        }
    }

    async createBot(pair, key, deposit, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const apiData = await ApiModel.findOne({ user: userData.id, key });
        const botData = await BotModel.findOne({});

        if (!botData.pairs.includes(pair)) {
            throw ApiError.BadRequest('Для данной торговой пары осутствует бот')
        }


        const userBot = await UserBotModel.create({
            user: userData.id,
            api: apiData.id,
            bot: botData.id,
            pair,
            deposit
        });

        console.log(userBot);

        return {
            message: "Bot created"
        }
    }
}

module.exports = new UserService();