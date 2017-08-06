const router = require('express').Router()
  , fs = require('fs')
  , getQRCode = require('../utils/getQRCode')
  , getXCXToken = require('../utils/getXCXToken')
  , qcos = require('../utils/qcos')
  , appId = process.env.XCXID
  , appSecret = process.env.XCXSECRET

router.get('/', (req, res)=> {
  const field = req.query.field
    , id = req.query.id
  if(!field) return res.send({code: 400, errMsg: 'err', data: '缺少必要参数' })
  getXCXToken(appId, appSecret).then((accessToken)=> {
    getQRCode(id, field, accessToken).then((data)=> {
      if(data.err) return res.send({code: 444, errMsg: 'wechat error', data: data.err })
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
        qcos.uploadFile(codeBuffer, filepath, fileSize, 'ppt/qrcodes').then((url)=> {
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