const express = require('express')
const app = express()
const port = 3000

app.get('/ping', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(App escuchando en el puerto: ${port})
})

app.get('/status', (request, response) => {
   const status = {
      'Status': 'Running'
   };

   response.send(status);
});