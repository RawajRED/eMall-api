const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


// TODO: Enable this
// exports.sendMessage = async (body, to) => client.messages
//     .create({
//         body,
//         from: '+12182768255',
//         to
//     })
//     .catch(err => console.log(err));

exports.sendMessage = async (body, to) => {console.log('sending', body, 'to', to)}