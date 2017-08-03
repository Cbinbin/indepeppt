const request = require('superagent')
  , wxApis = require('./wxApis')

function getXCXToken(appId, appSecret) {
  var xcxToken = new Promise((resolve, reject)=> {
    request.get(`${wxApis.token}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
    .end((err, result)=> {
      if(err) return reject(err)
      if(JSON.parse(result.text).errcode != null) return reject(result.text)
      var accessToken = JSON.parse(result.text).access_token
      resolve(accessToken)
    })
  })
  return xcxToken
}
//

module.exports = getXCXToken