const COS = require('cos-nodejs-sdk-v5')
  , crypto = require('crypto')
  , multer = require('multer')
  , path = require('path')
  , fs = require('fs')
  , qcloud = new COS({
    AppId: process.env.QCLOUDAPPID,
    SecretId: process.env.QCLOUDSECRETID,
    SecretKey: process.env.QCLOUDSECRETKEY
})
  , qcAppId = process.env.QCLOUDAPPID
  , qcBucket = process.env.QCBUCKET
  , qcRegion = process.env.QCREGION

function upload(req, res, single) {
  var upload = multer({ storage: multer.diskStorage({}) }).single(single)
  var fileUrl = new Promise((resolve, reject)=> {
    upload(req, res, (err)=> {
      if(err) return reject(err)
      if(req.file) {
        var rs = fs.createReadStream(req.file.path)
          , md5Hash = crypto.createHash('md5')
        rs.on('data', md5Hash.update.bind(md5Hash))
        rs.on('end', ()=> {
          var t = new Date().getTime()
            , reTag = md5Hash.digest('hex')
          var params = {
            Bucket: qcBucket,
            Region: qcRegion,
            Key: single + '/' + t + '_' + req.file.originalname,
            Body: req.file.path,
            ContentLength: req.file.size
          }
          qcloud.putObject(params, (err, data)=> {
            if(err) return reject(err)
            var url = geturl(qcBucket, qcAppId, params.Key)
            data.ETag = data.ETag.replace(/\"/g, "")
            if(reTag === data.ETag) resolve(url)
            else reject(`${reTag} != ${data.ETag}`)
          })
        })
      } else resolve(null)
    })
  })
  return fileUrl
}

function uploadFile(codeBuffer, filePath, size, single) {
  var fileUrl = new Promise((resolve, reject)=> {
    var rs = fs.createReadStream(filePath)
      , md5Hash = crypto.createHash('md5')
    rs.on('data', md5Hash.update.bind(md5Hash))
    rs.on('end', ()=> {
      var t = new Date().getTime()
        , reTag = md5Hash.digest('hex')
      var params = {
        Bucket: qcBucket,
        Region: qcRegion,
        Key: single + '/' + t + '_' + filePath.substring(15),
        Body: codeBuffer,
        ContentLength: size
      }
      qcloud.putObject(params, (err, data)=> {
        if(err) return reject(JSON.stringify(err))
        var url = geturl(qcBucket, qcAppId, params.Key)
        data.ETag = data.ETag.replace(/\"/g, "")
        if(reTag === data.ETag) resolve(url)
        else reject(`${reTag} != ${data.ETag}`)
      })
    })
  })
  return fileUrl
}

function deleteKey(fileUrl) {
  var result = new Promise((resolve, reject)=> {
    var key = decodeURIComponent(fileUrl.substring(45))
    var params = {
      Bucket: qcBucket,
      Region: qcRegion,
      Key: key
    }
    qcloud.deleteObject(params, (err, data)=> {
      if(err) return reject(err)
      //data.DeleteObjectSuccess//
      resolve(data)
    })
  })
  return result
}

function geturl(bucket, appid, pathname) {
  var exporturl = 'https://' + bucket + '-' + appid + '.cosgz.myqcloud.com'
  if (pathname) {
    exporturl += '/' + encodeURIComponent(pathname)
  }
  return exporturl
}

module.exports = {
  upload: upload,
  uploadFile: uploadFile,
  deleteKey: deleteKey
}