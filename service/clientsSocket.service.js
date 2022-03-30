class ClientsSocketService {
    io;

    connect(socket) {
        this.io = socket;

        this.io.on('connection', this.onConnect)
    }

    onConnect(socket) {
        console.log('Client connection!');

        socket.on('disconnect', () => {
            console.log('Client disconnected!');
        });
    }

    sendBotStatus(value) {
        this.io.emit('BOT_STATUS', JSON.stringify(value));
    }
}

module.exports = new ClientsSocketService();