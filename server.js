const express = require('express')
  , app = express()

require('./mongodb')
require('dotenv').config()

const port = process.env.PORT
  , routes = require('./routes')

const cors = require('cors')
  , bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static('public'))

// require('body-parser-xml')(bodyParser)
// app.use(bodyParser.xml({
//   limit: '2MB',
//   xmlParseOptions: {
//     normalize: true,
//     normalizeTags: true,
//     explicitArray: false
//   }
// }))

app.use('/', routes.home)
app.use('/qrcode', routes.qrcode)

app.listen(port, ()=> {
  console.log('Server is ruuning on port: ' + port)
  console.log('Use Ctrl-C to stop')
})