const { Schema, model } = require('mongoose');

const TransactionsShema = new Schema({
    txHash: { type: String, required: true },
    txAsset: { type: String, required: true },
    value: { type: Number, required: true},
    memo: { type: String, required: true },
    fromAddr: { type: String, required: true },
    toAddr: { type: String, required: true },
    timeStamp: { type: Number, required: true },
});

module.exports = model('Transactions', TransactionsShema);