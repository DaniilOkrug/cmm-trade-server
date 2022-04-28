const requests = require("../http");
const BotModel = require("../models/bot.model");

class BotService {
    async setBotSettigns(pairs, settings) {
        const bot = BotModel.findOne({});

        console.log(pairs);
        console.log(settings);

        if (!bot) {
            await BotModel.create({ pairs, settings });
        } else {
            await BotModel.findOneAndUpdate({}, { pairs, settings }, { upsert: true });
        }

        const newBotSettings = (await BotModel.find())[0];

        const response = await requests.get('/updateSettings');

        return {
            pairs: newBotSettings.pairs,
            ...newBotSettings.settings
        };
    }

    async getBlackList() {
        const botData = (await BotModel.find())[0];

        let pairs;

        try {
            pairs = (await requests.get('/pairs')).data;
        } catch (error) {
            throw ApiError.NotFound('Сервис временно недоступен!');
        }

        return {
            blacklist: botData.blacklist,
            spotPairs: pairs.spotPairs.filter(pair => pair.includes('BUSD')),
        }
    }

    async setBlackList(blacklist) {
        await BotModel.findOneAndUpdate({}, { blacklist }, { upsert: true });

        try {
            const response = (await requests.get('/updateBlacklist'));
        } catch (error) {
            throw ApiError.NotFound('Сервис временно недоступен!');
        }

        const botData = (await BotModel.find())[0];

        return { blacklist: botData.blacklist };
    }
}

module.exports = new BotService();