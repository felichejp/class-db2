const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Dependencias para el manejo de cookies
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { connect, queryLogin, queryNewUser, findTokenInDB, createUserToken, revokeTokenInDB} = require('./database/database');
dotenv.config();

const secretKey = 'secret_key_sam';  // LLave para general el token

const app = express()
const port = 9000
app.use(cors({ origin: '*' }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.post('/login', async(req, res) => {
  const { email, password } = req.body;
  //console.log(req.body)
  if( !email || !password ) {
    res.status(400).send("Username and password are required");
    return;
  }
  
  const client = await connect();
  const result = await queryLogin(client, { email, password }); // Se pasan los datos de registro del usuario
  // NOTA: El dbms regresa el atributo iduser sin el camel case
  if (result && result.status === 200) {
    // Si el usuario se encuentra en la db (login exitoso, code 200)
    // Se genera un token a partir del id del usuario (no es info confidencial, la llave secreta 
    // y se configura el tiempo de expiración)
    //console.log(result.data)
    // const token = generateToken(); ¿Cómo creamos el token?
   // console.log("Contaseña correcta",result.data );
    let token = makeToken(10);  // Se crea un token de 10 caracteres usando el idUsuario (único), no necesario completamente
    const expires = new Date(Date.now() + 3600000); // 1 hora
    const resultToken = await createUserToken(client, result.data.iduser, token, expires);
    if(resultToken && resultToken.length != 0)
    {
      // La última respuesta al cliente contiene su nombre, su token y el estatus de la petición
      res.send({
        user: result.data.iduser,
        token: resultToken.token,
        name: result.data.name,
        status: result.status,
        message: 'Authorized',
      });
    }
    else
    {
      res.send({
        user: undefined,
        token: undefined,
        status: 401, // Error de eutenticaciókn,
        message: 'Inauthorized',
      });
    }
  } else {
    res.send({
        user: undefined,
        token: undefined,
        status: 401, // Error de autenticación
        message: 'Inauthorized',
      });
  }
})

app.post('/register', async(req, res) => {
  const { username, password, name, lastname, email } = req.body;
  
 // console.log(req.body)
  // Rol por defecto
  const rol = 1
  if( !username || !password || !name || !lastname || !email  || !rol) {
    res.status(400).send("Username and password are required");
    return;
  }
  const client = await connect();
  const result = await queryNewUser(client, { username,rol, name, lastname, email, password});
  if (result && result.status === 200) {
    res.send(result);
  } else {
    res.send(result);
  }
})

app.post('/protected', async(req, res) => {
  // Para desestructurar solo se pueden sacar en orden los atributos del json que recibe???? y con el mismo nombre??????
  const {token} = req.body;  // Recibe el token que le envía el front
  // Se busca el token en la db
  const registerUser = await findTokenInDB(token);
  //console.log(received_token, registerUser.token);
  if (token === registerUser.token) {
   res.send(
    {
      status:200, 
      message: "Authorized"
    });
  }
  else{
    res.send(
    {
      status:401, 
      message: "Inauthorized"
    });
  }
})

app.post('/logout', async(req, res) => {
  // Para desestructurar solo se pueden sacar en orden los atributos del json que recibe???? y con el mismo nombre??????
  const {token} = req.body;  // Recibe el token que le envía el front
  // Se busca el token en la db para revocarlo
  const registerUser = await revokeTokenInDB(token);
  if(registerUser.revoke === true)
  {
    res.send(
      {
        status:200,
        revoke: registerUser.revoke,
        iduser: registerUser.iduser
      })
  }
  else{
    res.send(
      {
        status:500,
        revoke:!registerUser.revoke,
        iduser: undefined
      })
  }
})

app.listen(port, () => {
  console.log(`Backend de Samuel corriendo en el puerto ${port}`)
})

// Función para generar una cadena 
function makeToken(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      // Busca un caracter en el rango 0 - logitud de la cadena de caracteres válidos (exclusive)
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}