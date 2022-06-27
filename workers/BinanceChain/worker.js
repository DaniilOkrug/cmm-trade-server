const { parentPort } = require("worker_threads");
const axios = require('axios').default;
const { BncClient, crypto } = require("@binance-chain/javascript-sdk")
const TransactionsModel = require("../../models/transactions.model");
const mongoose = require('mongoose');

const api = 'https://dex.binance.org'; /// api string

const client = new BncClient(api);
client.chooseNetwork("mainnet");

// let lastTxHash;

(async () => {
    try {
        await mongoose.connect(process.env.DB_URL);

        client.recoverAccountFromPrivateKey(process.env.PRIVATE)
        await client.setPrivateKey(process.env.PRIVATE);
        await client.initChain();

        const address = client.getClientKeyAddress();

        setInterval(async () => {
            const transactionsResponse = (await axios.get(`https://api-binance-mainnet.cosmostation.io/v1/account/txs/${address}`)).data;
            const transactions = transactionsResponse.txArray.length > 1 ? transactionsResponse.txArray.sort((a, b) => b.timeStamp - a.timeStamp) : transactionsResponse.txArray;

            for (const transaction of transactions) {
                const transactionsInDB = await TransactionsModel.find();
                const transactionInDB = transactionsInDB.find((transData) => transData.txHash === transaction.txHash);
                if (!transactionInDB) {
                    console.log('New transaction', transaction);

                    await TransactionsModel.create({
                        txHash: transaction.txHash,
                        txAsset: transaction.txAsset,
                        value: transaction.value,
                        memo: transaction.memo,
                        fromAddr: transaction.fromAddr,
                        toAddr: transaction.toAddr,
                        timeStamp: transaction.timeStamp
                    });

                    if (transaction.txAsset.includes('USDT') && transaction.txType === 'TRANSFER' && transaction.toAddr === address) {
                        parentPort.postMessage({ type: 'NEW TRANSACTION', data: transaction });
                    }
                }
            }
        }, 10000)
    } catch (err) {
        console.log(err);
    }
})();