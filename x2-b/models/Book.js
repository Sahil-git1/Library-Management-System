const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    status: { type: String, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
