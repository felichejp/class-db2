const express = require('express');
const dotenv = require('dotenv');
const {connect, query} = require('./database.js')
dotenv.config();

const app = express()
const port = 9000
//app.use(express.json()) // El servidor solo interpreta/maneja JSONs
app.use(express.urlencoded({ extended: true })); // <== middleware permite leer datos enviados desde un formulario envia datos (Content-Type: application/x-www-form-urlencoded)
app.use(express.json()) // middleware que permite recibir datos enviados desde axios (Content-Type: application/json)

// Se puede probar con el agente postman para mandar los datos en el body del request
app.post('/auth', async (req, res) => {
  // res.send(req)  // req es un objeto complejo, req solo manda/imprime JSON, falla al convertiro al JSON
  //console.log(req)  // Si puede imprimir objetos complejos, porque no se mandan por red
  const { userName, password } = req.body;
  if (!userName || !password ) {
    res.status(400).send("Se requieren credenciales")
    return 
  }

  // SE hace hace la conexión a la db
  const client = await connect()
  // Se hace la consulta a la base de datos
  const response = await query(client,'SELECT * FROM users WHERE "user" = $1',[userName])

  if(response.length > 0)
  // La petición que hace axios termina con res.send, res.json, res.end, res.status(), etc
    res.json(response[0])  // Se regresa el json al cliente
  else
    res.send("Usuario no encontrado:(")
  //return 0  // El return es lo que regresa recibe el front??NOOO solo termina la función js
})

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
