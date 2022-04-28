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
const requests = require("../http");
const userBotService = require('../service/userBot.service');

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

    async getSettings() {
        const botSettings = (await BotModel.find())[0];

        let pairs;

        try {
            pairs = (await requests.get('/pairs')).data;
        } catch (error) {
            throw ApiError.NotFound('Сервис временно недоступен!');
        }

        const settings = JSON.parse(JSON.stringify(botSettings.settings)); //Deep copy of the object
        settings.pairs = botSettings.pairs;

        const response = {
            spotPairs: pairs.spotPairs.filter(pair => pair.includes('BUSD')),
            futuresPairs: pairs.futuresPairs.filter(pair => pair.includes('BUSD')),
            timeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
            settings
        };

        return response;
    }

    async getApiList(userId) {
        const apisData = await ApiModel.find({ user: userId });

        let apiList = [];
        for (let api of apisData) {
            apiList.push({
                name: api.name,
                status: api.status,
                exchange: api.exchange,
                key: api.key
            });
        }

        return apiList;
    }

    async addApi(key, secret, name, exchange, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const apiArrayByKeys = await ApiModel.find({ key, secret });
        const apiArrayByName = await ApiModel.find({ name });

        if (apiArrayByKeys.length != 0) {
            throw ApiError.Conflict('API ключи уже существуют');
        }

        if (apiArrayByName.length != 0) {
            throw ApiError.Conflict('Имя API уже существует');
        }

        //Checkd api
        const apiResponse = await requests.post('/check', { key, secret, exchange });

        if (!apiResponse.data.status) throw ApiError.BadRequest(apiResponse.data.message);

        await ApiModel.create({
            user: userData.id,
            key,
            secret,
            name,
            exchange
        });

        const userApiList = await ApiModel.find({ user: userData.id });

        return userApiList
    }

    async deleteApi(key, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);

        await ApiModel.deleteOne({ key, user: userData.id });

        const userApiList = await ApiModel.find({ user: userData.id });

        return userApiList;
    }

    async checkApi(key, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const apiData = await ApiModel.findOne({ key });

        if (!userData) {
            await ApiModel.updateOne({ key }, { status: "Error" });
        }

        const apiResponse = await requests.post('/check', {
            key,
            secret: apiData.secret,
            exchange: apiData.exchange
        });

        if (!apiResponse.data.status) {
            await ApiModel.updateOne({ key }, { status: "Error" });
        }

        const userApiList = await ApiModel.find({ user: userData.id });

        return userApiList
    }

    async createBot(name, key, deposit, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const apiData = await ApiModel.findOne({ user: userData.id, key });
        const botData = await BotModel.findOne({});

        await UserBotModel.create({
            user: userData.id,
            api: apiData.id,
            bot: botData.id,
            name,
            deposit
        });

        return userBotService.getBots(refreshToken);
    }

    async deleteBot(name, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const userBotData = await UserBotModel.findOne({ name, user: userData.id })

        console.log(userBotData);

        if (!userBotData) {
            throw ApiError.BadRequest('Невозможно удалить данного робота');
        }

        if (userBotData.status != "Disabled") {
            const botResponse = await requests.post('/delete', {
                botId: userBotData._id
            });

            if (botResponse.data.status != "Disabled") {
                throw ApiError.BadRequest('При удалении возникла ошибка');
            }
        }

        await UserBotModel.deleteOne({ name, user: userData.id });

        return userBotService.getBots(refreshToken);
    }

    async startBot(name, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const userBotData = await UserBotModel.findOne({ name, user: userData.id })

        if (!userBotData) {
            throw ApiError.BadRequest('Невозможно запустить данного робота');
        }

        const botResponse = await requests.post('/start', {
            botId: userBotData._id
        });

        if (botResponse.data.status != "Wait") {
            throw ApiError.BadRequest('При запуске возникла ошибка');
        }

        await UserBotModel.updateOne({ name, user: userData.id }, { status: botResponse.data.status });

        return userBotService.getBots(refreshToken);
    }

    async stopBot(name, refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);
        const userBotData = await UserBotModel.findOne({ name, user: userData.id });

        if (!userBotData) {
            throw ApiError.BadRequest('Невозможно остановить данного робота. Робот отсутствует.');
        }

        const botResponse = await requests.post('/stop', {
            botId: userBotData._id
        });

        if (botResponse.data.status != "Stopping") {
            throw ApiError.BadRequest('При остановке возникла ошибка');
        }

        await UserBotModel.updateOne({ name, user: userData.id }, { status: botResponse.data.status });

        return userBotService.getBots(refreshToken);
    }
}

module.exports = new UserService();