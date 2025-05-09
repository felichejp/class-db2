const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send("Fabian first PR:)")
  //este lo hizo Ana pero tampoco tiene laptop
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
