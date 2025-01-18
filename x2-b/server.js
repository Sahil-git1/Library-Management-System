const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
});

const User = mongoose.model('User', userSchema);

// Book Schema and Model
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, enum: ['fiction', 'non-fiction', 'science', 'technology','other'] },
    status: { type: String, enum: ['available', 'borrowed', 'unavailable'], default: 'available' },
    stock: { type: Number, default: 0 },
    description: { type: String }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

// Transaction Schema and Model

// User Routes
// Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a New User
app.post('/api/users', async (req, res) => {
    const { username, email, role, status } = req.body;
    try {
        const newUser = new User({ username, email, role, status });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
    const { username, email, role, status } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role, status },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Book Routes
// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) query.category = category;
        if (status) query.status = status;

        const books = await Book.find(query);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new book
app.post('/api/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a book
app.put('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a book
app.delete('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Transaction Routes
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;