const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send("Si aparece esto es porque si jaló bien ajua")
  //esto lo hizo alexis pero no tiene lap
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
