const request = require('superagent')
  , wxApis = require('./wxApis')

function getQRCode(field, accessToken) {
  var codeData = new Promise((resolve, reject)=> {
    var fields = String(field)
    request.post(`${wxApis.qrcode}?access_token=${accessToken}`)
    .send({
      path: `pages/login/login?router=scanCode&field=${fields}`,
      width: 480
    })
    .set('Content-Type', 'application/json')
    .end((err, result)=> {
      if(err) return reject(err)
      var data = {
        QRcodeBuffer: result.body,
        fileSize: JSON.parse(result.res.rawHeaders[11]),
      }
      resolve(data)
    })
  })
  return codeData
}

module.exports = getQRCode