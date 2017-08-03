const mongoose = require('mongoose')
  , db = mongoose.connection

mongoose.connect('mongodb://localhost/pptindepe', {useMongoClient: true}) //mongoose => 4.11.0
db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', ()=> {
  console.log('mongoose opened!')
})