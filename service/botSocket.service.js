const userBotModel = require("../models/userBot.model");
const { sendBotStatus } = require("./clientsSocket.service");

class SocketService {
    async botStatusUpdate(botData) {
        switch (botData.status) {
            case 'Active':
            case 'Wait':
                await userBotModel.findByIdAndUpdate(botData.botId, {
                    status: botData.status,
                    pair: botData.pair,
                    error: '-'
                });
                break;
            case 'Disabled':
                await userBotModel.findByIdAndUpdate(botData.botId, {
                    status: botData.status,
                    pair: '',
                    error: '-'
                });
                break;
            case 'Error':
                await userBotModel.findByIdAndUpdate(botData.botId, {
                    status: botData.status,
                    pair: botData.pair,
                    error: replaceAll(botData.error, 'MongooseError: ', '')
                });
                break;
            default:
                break;
        }

        // const newUserBotData = await userBotModel.findById(botData.botId);
        // sendBotStatus(newUserBotData)
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

module.exports = new SocketService();