const express = require('express');
const dotenv = require('dotenv');
const { connect, query } = require('./database/database');
dotenv.config();

const app = express()
const port = 9000
app.use(express.json())

app.post('/auth', async(req, res) => {
  const { username, password } = req.body;
  if( !username || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
   console.log('BODY:', req.body); 
  const client = await connect();
  const result = await query( 'SELECT * FROM users WHERE username = $1 AND password = crypt($2, password);', [username,password],client);
  console.log('RESULT:', result.rows);
  //console.log('RESULT:', result.rows[0].password);
  if (result && result.rows.length > 0) {
    res.send("User authenticated");
  } else {
    res.send("User not authenticated");
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
