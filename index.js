const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
  res.send('Hello DB2 class CICD test commit!!!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})