const userBotModel = require("../models/userBot.model");
const { sendBotStatus } = require("./clientsSocket.service");

class SocketService {
    async botStatusUpdate(botId, status, pair = false) {
        if (pair) {
            await userBotModel.findByIdAndUpdate(botId, { status, pair });
        } else {
            await userBotModel.findByIdAndUpdate(botId, { status, pair: '' });
        }

        const botData = await userBotModel.findById(botId);
        sendBotStatus(botData)
    }
}

module.exports = new SocketService();