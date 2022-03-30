const { Schema, model } = require('mongoose');

const UserBotShema = new Schema({
    user: { type: Schema.Types.ObjectId, red: 'User' },
    api: { type: Schema.Types.ObjectId, red: 'Api' },
    bot: { type: Schema.Types.ObjectId, red: 'Bot' },
    name: { type: String, required: true },
    deposit: { type: Number, required: true },
    status: { type: String, default: "Disabled" },
    pair: { type: String },
});

module.exports = model('UserBot', UserBotShema);