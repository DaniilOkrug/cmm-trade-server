module.exports = class ApiDto {
    name;
    status;
    exchange;
    key;

    constructor(model) {
        this.name = model.name;
        this.status = model.status;
        this.exchange = model.exchange;
        this.key = model.key;
    }
}