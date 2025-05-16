const express = require('express');
const dotenv = require('dotenv');
const {connect, query} = require('./database.js')
dotenv.config();

const app = express()
const port = 9000
app.use(express.json()) // El servidor solo interpreta/maneja JSONs
app.use(express.urlencoded({ extended: true })); // <== middleware permite leer form-data

// Se puede probar con el agente postman para mandar los datos en el body del request
app.post('/auth', async (req, res) => {
  // res.send(req)  // req es un objeto complejo, req solo manda/imprime JSON, falla al convertiro al JSON
  //console.log(req)  // Si puede imprimir objetos complejos, porque no se mandan por red
  const { username, password } = req.body;
  if (!username || !password ) {
    res.status(400).send("Se requieren credenciales")
    return 
  }
  const clientDB = await connect();
  // Validar la conexión con la base
  res.send("Conexión exitosa a base de datos local")
  //Consulta de prueba local
  const result = await query(clientDB, "SELECT osm_id, way, highway FROM planet_osm_line limit 1")
  res.send(result.rows)
  /*
  // Validar la conexión con la base
  res.send("Conexión exitosa a base de datos remota")
  // Consulta para la base de datos remota
  //const result = await query(clientDB,'SELECT * FROM users WHERE username = $1', [username]); 
  /*if(result.rows.length > 0 && result.rows[0].isPassOk)
  {
    res.send("Usuario autenticado")
  }
  else
  {
    res.send("Usuario no autentucado")
  }*/
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
