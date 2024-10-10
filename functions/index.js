const functions = require('firebase-functions/v2')
const admin = require('firebase-admin')
const mailgun = require('mailgun-js')
const cors = require('cors')({ origin: true })

admin.initializeApp()

const apiKey = 'ff9a2887a5cf45c21e933d3a73ce985b-5dcb5e36-a45f5554'
const domain = 'db-67c2b.firebaseapp.com'
const mg = mailgun({ apiKey, domain })

exports.sendMail = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(400).send('Please send a POST request')
    }

    const { to, subject, text } = req.body

    if (!to || !subject || !text) {
      return res.status(400).send('Missing email parameters')
    }

    const data = {
      from: 'iscfen9@gmail.com',
      to: to,
      subject: subject,
      text: text
    }

    try {
      await mg.messages().send(data)
      return res.status(200).send('Email sent successfully')
    } catch (error) {
      console.error('Mailgun error:', error)
      return res.status(500).send('Email failed to send')
    }
  })
})
