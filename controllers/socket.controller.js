const { io } = require("socket.io-client");
const socketService = require("../service/botSocket.service");

//Control socket with Bot server
class SocketController {
    connect() {
        const socket = io.connect(process.env.BOTSERVICE_SOCKET_URL);

        socket.on('connect', () => {
            console.log("Bot service connected");
        });

        socket.on("disconnect", () => {
            console.log("Bot service disconnected"); // false
        });

        socket.on("BOT_STATUS_UPDATE", (data) => {
            const botData = JSON.parse(data);
            // console.log('Bot status update: ', botData.status);
            console.log(botData);

            // if (botData.pair) {
            //     socketService.botStatusUpdate(botData.botId, botData.status, botData.pair);
            // } else {
            //     socketService.botStatusUpdate(botData.botId, botData.status);
            // }
        });
    }
}

module.exports = new SocketController();