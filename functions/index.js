const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')

admin.initializeApp()

// get SendGrid API Key from firebase config
const sendGridApiKey = functions.config().sendgrid.api_key
sgMail.setApiKey(sendGridApiKey)

// specify the region where the function will be deployed
exports.sendEmailWithAttachment = functions.https.onCall(async (data, context) => {
  const { to, subject, text, attachmentContent, attachmentFileName } = data

  const msg = {
    to: to,
    from: 'iscfen@gmail.com',
    subject: subject,
    text: text,
    attachments: [
      {
        content: attachmentContent,
        filename: attachmentFileName,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
})
