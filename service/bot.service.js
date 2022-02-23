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

        return {
            message: "Settings saved"
        }
    }
}

module.exports = new BotService();