const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendMail = async ({mail, subject, text, html}) => {
    const msg = {
      to: mail, // Change to your recipient
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject,
      text,
      html,
    }

    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })    
}