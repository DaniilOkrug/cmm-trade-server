require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require("https");
const fs = require("fs");
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const errorMiddleware = require('./middleware/error.middleware');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN
}));
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if (process.env.NODE_ENV == 'production') {
            https.createServer(
                {
                    key: fs.readFileSync("server.key"),
                    cert: fs.readFileSync("server.cert"),
                },
                app
            ).listen(PORT, () => {
                console.log(`Server started in production mode on PORT = ${PORT}`);
            })

        } else { //development mode
            app.listen(PORT, () => console.log(`Server started in development mode on PORT = ${PORT}`))
        }
    } catch (e) {
        console.log(e);
    }
}

start();