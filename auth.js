const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { Pool } = require('pg');
const passport = require('passport');

const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).send('Error registering new user');
    }
    res.status(201).send(result.rows[0]);
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.query('SELECT * FROM users WHERE username = $1', [username], async (err, result) => {
    if (err) {
      return res.status(500).send('Error logging in user');
    }
    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  });
});

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).send('You have accessed a protected route');
});

module.exports = router;