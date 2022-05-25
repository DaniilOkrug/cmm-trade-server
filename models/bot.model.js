const { Schema, model } = require('mongoose');

//Bots created by Admin
const BotShema = new Schema({
    pairs: { type: [String], required: true },
    blacklist: { type: [String] },

    settings: {
        algorithm: { type: String, required: true },
        exchange: { type: String, required: true },
        leverage: { type: Number, required: false, default: 1 },
        analyzer: {
            enabled: { type: Boolean, required: true },
            period: { type: String },
            interval: { type: String },
            priceChange: { type: Number },
            minPriceChangeNumber: { type: Number },
            minVolume: { type: Number },
            rsi: {
                enabled: { type: Boolean },
                period: { type: Number },
                value: { type: Number },
                timeframes: { type: Array }
            },
            pampAndDump: {
                enabled: { type: Boolean },
                filters: { type: Array }
            }
        },
        grid: {
            size: { type: Number, required: true },
            ordersNumber: { type: Number, required: true },
            distribution: { type: String, required: true },
            martingeil: { type: Number, required: true },
            indentFirstOrder: { type: Number, required: true },
            profit: { type: Number, required: true },
            priceFollow: { type: Number, required: true },
            priceFollowDelay: { type: Number, required: true }, //minutes
            newGridDelay: { type: Number, required: true },
            endCycleDelay: { type: Number, required: true },
            logFactor: { type: Number, required: true }
        }
    },
});

module.exports = model('Bot', BotShema);