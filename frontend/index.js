const express = require('express');
//const session = require('express-session');
const axios = require('axios')

const app = express()
const port = 8000

// Le dice a express que lea el cuerpo de las peticiones si vienen en formato url-encoded (req.body)
app.use(express.urlencoded({extended:true}));
app.use(express.json())



// Se sirve el index.html que conendrá el formulario para hacer el post
app.get("/", (req, res)=>
  {
    // La ruta de los archivos debe ser absoluta o} configurar un root. Se sirve un archivo del servidor 
    res.sendFile("/home/sam_mtz/bases2/class-db2/resources/index.html");
  });
  

app.post("/auth", async (req, res) =>
{
  // Se desestructuran los datos desde JSON que conforma el body del request)
  const {userName, password} = req.body;
  const data = {
    userName:userName,
    password: password
  }
  // Se hace la petición al back, mediante el axios.method("path_require_backend", data)
  // method es el envío y tiene que estar definido en el back, data se convierte en el req.body de la petición
  // Se debe especificar el método de envío de datos http o https
  const res_from_back = await axios.post("http://localhost:9000/auth", data)
  res.send(res_from_back.data);
  //console.log(res_from_back.data)
})

app.listen(port, () => {
  console.log(`Frontend listening on port ${port}`)
})
