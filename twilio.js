const accountSid = "AC354fed0201091ecf1710fcd24385aaf4";
const authToken = "478b81940b7f2d7bac21c8503a9a6fac";

const client = require('twilio')(accountSid, authToken);

const sendMessage = (body) => client.messages
    .create({
        body,
        from: '+12255290371',
        to: '+201140008042'
    })
    .then(message => console.log('Sent message!', message))
    .catch(err => console.log(err));

export default sendMessage;

