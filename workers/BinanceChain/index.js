const { Worker } = require("worker_threads");
const userService = require("../../service/user.service");

class BinanceChainWorker {
    createWorker() {
        return new Promise((resolve, reject) => {
            try {
                const worker = new Worker("./workers/BinanceChain/worker.js");

                worker.on("message", (data) => {
                    switch (data.type) {
                        case 'NEW TRANSACTION':
                            userService.deposit(data.data.memo, data.data.value);
                            break;
                    
                        default:
                            console.log(data);
                            break;
                    }
                });

                worker.on("error", error => {
                    console.log(error);
                });
                worker.on("exit", exitCode => {
                    console.log("BinanceChain Worker exit with code: " + exitCode);
                })

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}

class Singleton {
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new BinanceChainWorker();
        }
        return Singleton.instance;
    }
}

module.exports = Singleton.getInstance();