const axios = require('axios');

module.exports = axios.create({
    baseURL: process.env.BOTSERVICE_URL,
});