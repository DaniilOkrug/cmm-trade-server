const { Int32 } = require('mongodb');
const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "User"}, // 0: Admin, 1: User
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
});

module.exports = model('User', UserSchema);