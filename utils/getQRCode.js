const request = require('superagent')
  , wxApis = require('./wxApis')

function getQRCode(path, field, accessToken) {
  var codeData = new Promise((resolve, reject)=> {
    var fields = String(field)
    request.post(`${wxApis.qrcode}?access_token=${accessToken}`)
    .send({
      path: `${fields}`,//`pages/share/share?router=scanCode&field=${fields}`,
      width: 480,
    })
    .set('Content-Type', 'application/json')
    .end((err, result)=> {
      if(err) return reject(err)
      var data = {
        QRcodeBuffer: result.text !== undefined ? null : result.body,
        fileSize: result.text !== undefined ? 0 : JSON.parse(result.res.rawHeaders[11]),
        err: result.text !== undefined ? result.body : null
      }
      resolve(data)
    })
  })
  return codeData
}

module.exports = getQRCode