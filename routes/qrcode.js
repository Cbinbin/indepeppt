const router = require('express').Router()
  , fs = require('fs')
  , getQRCode = require('../utils/getQRCode')
  , getXCXToken = require('../utils/getXCXToken')
  , qcos = require('../utils/qcos')
  , appId = process.env.XCXID
  , appSecret = process.env.XCXSECRET

router.get('/', (req, res)=> {
  const field = req.query.field
  getXCXToken(appId, appSecret).then((accessToken)=> {
    getQRCode(field, accessToken).then((data)=> {
      var codeBuffer = data.QRcodeBuffer
        , fileSize = data.fileSize
        , fileName = `scanQRcode.jpg`
        , filepath = `public/QRcodes/${fileName}`
        , fileStream = fs.createWriteStream(filepath, { 
        flags: 'w', 
        defaultEncoding: 'base64', 
        fd: null, 
        mode: 0o666, 
        autoClose: true 
      })
      fileStream.write(codeBuffer)
      fileStream.end(()=> {
        qcos.uploadFile(filepath, fileSize, 'ppt/qrcodes').then((url)=> {
          fs.unlink(filepath, (err)=> {
            if(err) return console.log('err')
            //删除本地文件
          })
          res.send({code: 200, errMsg: 'ok', data: { QRCodeUrl: url } })
        })
      })
    })
  })
})

module.exports = router