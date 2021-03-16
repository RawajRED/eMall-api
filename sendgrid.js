const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")

exports.sendMail = async ({mail, subject, text, html}) => {
    const msg = {
      to: mail, // Change to your recipient
      from: "asserhamad96@gmail.com",
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