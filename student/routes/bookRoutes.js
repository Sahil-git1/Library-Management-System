const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a new book
router.post('/', async (req, res) => {
    const { title, author, isbn, category, status, stock, description } = req.body;
    const newBook = new Book({
        title,
        author,
        isbn,
        category,
        status,
        stock,
        description,
    });
    
    try {
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Edit an existing book
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, category, status, stock, description } = req.body;

    try {
        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { title, author, isbn, category, status, stock, description },
            { new: true }
        );
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a book
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
