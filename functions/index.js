const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const sgMail = require('@sendgrid/mail')
const cors = require('cors')

const corsOptions = {
  origin: 'https://db-67c2b.web.app',
  methods: ['POST', 'OPTIONS']
}
// sgMail.setApiKey('your api key')

exports.sendGridEmail = onRequest(cors(corsOptions), async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsOptions.origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).send('Preflight request successful')
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const { to, from, subject, text, html } = req.body

  const msg = {
    to: to || 'iscfen9@gmail.com',
    from: from || 'iscfen@gmail.com',
    subject: subject || 'Sending with SendGrid is Fun',
    text: text || 'and easy to do anywhere, even with Node.js',
    html: html || '<strong>and easy to do anywhere, even with Node.js</strong>'
  }

  try {
    await sgMail.send(msg)
    logger.info('Email sent successfully')
    return res.status(200).send('Email sent successfully')
  } catch (error) {
    logger.error('Error sending email:', error)
    if (error.response) {
      logger.error('Response:', error.response.body)
    }
    return res.status(500).send('Failed to send email')
  }
})
