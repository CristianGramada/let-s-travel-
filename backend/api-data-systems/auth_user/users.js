const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Get all users
router.get('/', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('id');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send({ error: 'Failed to fetch users' });
    }

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

    // Insert into Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ name: name, email: email }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);

      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505' || error.message.includes('duplicate')) {
        return res.status(409).send({ error: 'Email already exists' }); // 409 means Conflict
      }

      return res.status(500).send({ error: 'Failed to create user' });
    }

    // Return the created user with 201 status
    res.status(201).send(newUser); // 201 means Created (successful POST)
  } catch (error) {
    console.error('Database error:', error);
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

    // Query Supabase for specific user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Check if user not found
      if (error.code === 'PGRST116') {
        return res.status(404).send({ error: 'User not found' }); // 404 means Not Found
      }
      
      return res.status(500).send({ error: 'Failed to fetch user' });
    }

    // Return the user 
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
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Check if user not found
      if (error.code === 'PGRST116') {
        return res.status(404).send({ error: 'User not found' });
      }
      
      return res.status(500).send({ error: 'Failed to fetch user by email' });
    }

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
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .ilike('name', `%${name}%`);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send({ error: 'Failed to fetch users by name' });
    }

    if (users.length === 0) {
      return res.status(404).send({ error: 'No users found with this name' });
    }

    res.send(users); // Note: could be multiple users with same/similar name

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ error: 'Failed to fetch users by name' }); // 500 means Internal Server Error
  }
});

module.exports = router;



