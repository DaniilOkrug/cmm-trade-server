const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "User"}, // 0: Admin, 1: User
    comission: { type: Number, default: 20},
    balance: { type: Number, default: 0 },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String }
});

module.exports = model('User', UserSchema);