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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})