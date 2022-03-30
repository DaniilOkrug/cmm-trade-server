module.exports = class UserDto {
    email;
    role;
    id;
    isActivated;
    balance;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.role = model.role;
        this.isActivated = model.isActivated;
        this.balance = model.balance;
    }
}