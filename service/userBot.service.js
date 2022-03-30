const BotModel = require("../models/bot.model");
const UserBotModel = require("../models/userBot.model");
const ApiModel = require("../models/api.model");

const tokenService = require("./token.service");

class UserBotService {
    async getBots(refreshToken) {
        const userData = tokenService.validateRefreshToken(refreshToken);

        const userBots = await UserBotModel.find({ user: userData.id });

        let botList = [];
        if (userBots.length != 0) {
            const botSettings = (await BotModel.find())[0];
            userBots.forEach(bot => {
                botList.push({
                    name: bot.name,
                    pair: typeof bot.pair === 'undefined' ? '' : bot.pair,
                    status: bot.status,
                    deposit: bot.deposit,
                    exchange: botSettings.settings.exchange,
                    profit: 0,
                    error: '-'
                });
            });
        }

        return botList;
    }

    async botInfoUpdate(botId, status) {
        const userBotData = await UserBotModel.findByIdAndUpdate(botId, { status })

        console.log(userBotData);

        return userBotData;
    }
}

module.exports = new UserBotService();