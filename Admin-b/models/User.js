const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], required: true },
    status: { type: String, enum: ['active', 'suspended'], required: true, default: 'active' },
});

module.exports = mongoose.model('User', userSchema);