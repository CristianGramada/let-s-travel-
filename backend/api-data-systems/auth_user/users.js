const express = require('express');
const router = express.Router();
const pool = require('../database');

// Get all users
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Users ORDER BY users_id');
    const users = result.rows;
    client.release();

    res.send(users);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ error: 'Failed to fetch users' }); // 500 means Internal Server Error
  }
});



// Create a new user
router.post('/', async (req, res) => {
  try {
    // Get data from request body
    const { name, email } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).send({ error: 'Name and email are required' }); // 400 means Bad Request
    }

    // Insert into database
    const client = await pool.connect();
    const insertSQL = 'INSERT INTO Users (users_name, users_email) VALUES ($1, $2) RETURNING *';
    const result = await client.query(insertSQL, [name, email]);
    const newUser = result.rows[0];
    client.release();

    // Return the created user with 201 status
    res.status(201).send(newUser); // 201 means Created (successful POST)
  } catch (error) {
    console.error('Database error:', error);

    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505') { // PostgreSQL unique violation error code for duplicate key
      return res.status(409).send({ error: 'Email already exists' }); // 409 means Conflict (duplicate email)
    }

    res.status(500).send({ error: 'Failed to create user' }); // 500 means Internal Server Error
  }
});



// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    // Get ID from URL parameter
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).send({ error: 'Invalid user ID' }); // 400 means Bad Request
    }

    // Query the database for specific user
    const client = await pool.connect();
    const selectSQL = 'SELECT * FROM Users WHERE users_id = $1';
    const result = await client.query(selectSQL, [id]);
    client.release();

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'User not found' }); // 404 means Not Found
    }

    // Return the user 
    const user = result.rows[0];
    res.send(user);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ error: 'Failed to fetch user' }); // 500 means Internal Server Error
  }
});



// Filter by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Users WHERE users_email = $1', [email]);
    client.release();

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.send(user);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ error: 'Failed to fetch user by email' }); // 500 means Internal Server Error
  }
});



// Filter by name
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Users WHERE users_name ILIKE $1', [`%${name}%`]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'No users found with this name' });
    }

    const users = result.rows; // Note: could be multiple users with same/similar name
    res.send(users);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ error: 'Failed to fetch users by name' }); // 500 means Internal Server Error
  }
});

module.exports = router;



