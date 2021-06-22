const fs = require("fs");
csv = fs.readFileSync("sellers.csv");
const fetch = require("node-fetch");


var array = csv.toString().split("\r");
let result = [];

let headers = array[0].split(",");

for (let i = 2; i < array.length -1 ; i++) {
  let obj = {}

  let str = array[i]


  let properties = str.split(",")

  for (let j in headers) {
    obj[headers[j]] = properties[j].trim();
  }
  fetch('http://localhost:5000/api/seller/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  })
  .then(response => response.json())
  .catch(err => console.log(err));
}

