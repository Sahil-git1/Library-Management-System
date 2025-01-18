const express = require('express');
const { getAllUsers, addUser, editUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', getAllUsers); // Fetch all users
router.post('/', addUser); // Add a new user
router.put('/:id', editUser); // Update a user
router.delete('/:id', deleteUser); // Delete a user

module.exports = router;
