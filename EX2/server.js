const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    bookId: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' },
    fine: { type: Number, default: 0 },
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Issue a Book
app.post('/api/transactions/issue', async (req, res) => {
    try {
        const { studentId, bookId, dueDate } = req.body;
        const transaction = new Transaction({ studentId, bookId, dueDate });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error issuing book', error: error.message });
    }
});

// Add a Fine
app.put('/api/transactions/fine', async (req, res) => {
    try {
        const { studentId, bookId, fine } = req.body;
        const transaction = await Transaction.findOne({ studentId, bookId, status: 'Issued' });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        transaction.fine += fine;
        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error adding fine', error: error.message });
    }
});

// Get All Transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
