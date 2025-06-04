const express = require('express');
const dotenv = require('dotenv');
const { connect, query } = require('./database/database');
const fs = require('fs');
const path = require('path');
dotenv.config();

const app = express()
const port = 9000
app.use(express.json())

// Load queries from queries.json
const queriesPath = path.join(__dirname, 'database', 'queries.json');
const queries = JSON.parse(fs.readFileSync(queriesPath, 'utf8'));

// Function to get query by name
const getQueryByName = (name) => {
  const queryObject = queries.find(q => q.name === name);
  return queryObject ? queryObject.query : null;
};

app.post('/auth', async(req, res) => {
  const { username, password } = req.body;
  if( !username || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  console.log('BODY:', req.body); 
  const client = await connect();
  
  const result = await query(
    `SELECT u.id, u.name, u.rol 
     FROM users u 
     JOIN passwords p ON u.id = p.iduser 
     WHERE u."user" = $1 AND p.password = crypt($2, p.password)`,
    [username, password],
    client
  );
  
  console.log('RESULT:', result.rows);
  if (result && result.rows.length > 0) {
    res.send("User authenticated");
  } else {
    res.send("User not authenticated");
  }
})

app.post('/register', async(req, res) => {
  const { username, firstName, lastName, email, password } = req.body;
  
  if(!username || !firstName || !lastName || !email || !password) {
    res.status(400).send("All fields are required");
    return;
  }
  
  try {
    const client = await connect();
    const registerQuery = getQueryByName('register');
    
    if (!registerQuery) {
      res.status(500).send("Registration query not found");
      return;
    }
    
    const result = await query(
      registerQuery,
      [username, firstName, lastName, email, password],
      client
    );
    
    console.log('REGISTRATION RESULT:', result.rows);
    
    if (result && result.rows.length > 0) {
      res.send("User registered successfully");
    } else {
      res.status(500).send("Registration failed");
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).send("Username or email already exists");
    } else {
      res.status(500).send("Registration failed: " + error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})