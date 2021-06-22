const fs = require("fs");
const fetch = require("node-fetch");
var FormData = require('form-data');

// Replace with your local dir
const dir = '/home/salem/eMall-api/s3_images/';

fs.readdir(dir, (err, files) => {
    if (err)
      console.log(err);
    else {
      files.forEach(file => {

        let uri = dir+file ;
        var formData = new FormData();

        formData.append('photo', fs.createReadStream(uri));

        fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            headers: {
            //'content-type': 'multipart/form-data',
            },
            body: formData,
        })
        .then(response => response.json())
        .catch(err => console.log(err));


    })
    }
  })



