const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sendMessage = async (body, to) => client.messages
    .create({
        body,
        from: '+12255290371',
        to
    })
    .catch(err => console.log(err));

export default sendMessage;

