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

        return {
            pairs: newBotSettings.pairs,
            ...newBotSettings.settings
        };
    }
}

module.exports = new BotService();