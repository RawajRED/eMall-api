const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
var path = require('path')
const s3Storage = require('multer-sharp-s3');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-2"
});


exports.upload = multer({
    storage: s3Storage({
      Key: (req, file, cb)=> {
        cb(null, Date.now().toString() + path.extname(file.originalname));
        //cb(null, file.originalname); for fixing big image sizes .
       },
      s3,
      Bucket: 'emallbucket',
      ACL: 'public-read',
      resize : {height: 700, width: 1200, options: {withoutEnlargement: true, fit: 'inside'}},
      metadata: (req, file, cb)=> {
        cb(null, {fieldName: file.fieldname});
      },
    }) 
  })

exports.uploadThumnail = multer({
  storage: s3Storage({
    Key(req, file, cb) {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
    s3,
    Bucket: 'emallbucket',
    acl: 'public-read',
    resize : {height : 300, width : 400, options :{withoutEnlargement: true,fit: 'inside'}},
    //toFormat : {type : 'jpeg', options :{ quality : 50, mozjpeg : true}},
    metadata(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
  }) 
})

exports.remove = async (Key) => s3.deleteObject({Bucket: 'emallbucket', Key}, (err, data) => {
  if(err) throw new Error(err);
  else console.log(data)
})