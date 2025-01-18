const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Book Schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, enum: ['fiction', 'non-fiction', 'science', 'technology'] },
    status: { type: String, enum: ['available', 'borrowed', 'unavailable'], default: 'available' },
    stock: { type: Number, default: 0 },
    description: { type: String }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

// Routes
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
// app.post('/api/books', async (req, res) => {
//     try {
//         const book = new Book(req.body);
//         await book.save();
//         res.status(201).json(book);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Update a book
// app.put('/api/books/:id', async (req, res) => {
//     try {
//         const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!book) return res.status(404).json({ message: 'Book not found' });
//         res.json(book);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Delete a book
// app.delete('/api/books/:id', async (req, res) => {
//     try {
//         const book = await Book.findByIdAndDelete(req.params.id);
//         if (!book) return res.status(404).json({ message: 'Book not found' });
//         res.json({ message: 'Book deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;