const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    bookId: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Issued', 'Overdue', 'Returned'], default: 'Issued' },
    fine: { type: Number, default: 0 },
});

module.exports = mongoose.model('Transaction', transactionSchema);
