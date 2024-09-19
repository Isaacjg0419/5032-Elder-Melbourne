const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')
const sgMail = require('@sendgrid/mail')
const functions = require('firebase-functions')

// Initialize Firebase Admin SDK
admin.initializeApp()

sgMail.setApiKey(functions.config().sendgrid.apikey)

// Create CORS middleware with options
const corsOptions = {
  origin: true // Allows all origins
}

const corsMiddleware = cors(corsOptions)

// Function to send an email
exports.sendEmail = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const { to, subject, text } = req.body

      if (!to || !subject || !text) {
        return res.status(400).send('Missing required fields')
      }

      const msg = {
        to,
        from: 'jfen0016@student.monash.edu',
        subject,
        text,
        html: `<strong>${text}</strong>`
        // attachments: [
        //   {
        //     content: attachmentContent,
        //     filename: attachmentFileName,
        //     type: 'application/pdf',
        //     disposition: 'attachment'
        //   }
        // ]
      }

      await sgMail.send(msg)
      res.status(200).send('Email sent successfully')
    } catch (error) {
      console.error('Error sending email:', error.message)
      res.status(500).send('Error sending email')
    }
  })
})
