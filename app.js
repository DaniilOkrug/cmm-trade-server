require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require("https");
const fs = require("fs");
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const errorMiddleware = require('./middleware/error.middleware');
const socketController = require('./controllers/socket.controller');
const clientsSocketService = require('./service/clientsSocket.service');
const http = require('http');
const binanceChain = require('./workers/BinanceChain');

const PORT = process.env.PORT || 5000;
const app = express();
const server = process.env.NODE_ENV == 'production' ? https.createServer(
    {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
    },
    app
) : http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ['GET', 'POST'],
    }
});


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionSuccessStatus: 200
}));
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        server.listen(PORT, () => console.log(`Server started in ${process.env.NODE_ENV} mode on PORT = ${PORT}`))

        //Start websocket connection to the main server
        socketController.connect();
        // clientsSocketService.connect(io);

        binanceChain.createWorker();
    } catch (e) {
        console.log(e);
    }
}

start();