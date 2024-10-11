const functions = require('firebase-functions/v2')
const admin = require('firebase-admin')
const mailgun = require('mailgun-js')
const cors = require('cors')({ origin: true })

admin.initializeApp()

const apiKey = 'ff9a2887a5cf45c21e933d3a73ce985b-5dcb5e36-a45f5554'
const domain = 'db-67c2b.firebaseapp.com'
const mg = mailgun({ apiKey, domain })

exports.sendMail = functions.https.onRequest((req, res) => {
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
      to,
      subject,
      text
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

exports.getUsers = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const usersSnapshot = await admin.firestore().collection('users').get()
      const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      res.status(200).send(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).send('Error fetching users')
    }
  })
})

exports.getAdmins = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const adminsSnapshot = await admin.firestore().collection('admins').get()
      const admins = adminsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      res.status(200).send(admins)
    } catch (error) {
      console.error('Error fetching admins:', error)
      res.status(500).send('Error fetching admins')
    }
  })
})

exports.updateUserOrAdmin = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const { id, data, collection } = req.body
  if (!id || !data || !collection) {
    return res.status(400).send('Missing parameters')
  }

  try {
    const docRef = admin.firestore().collection(collection).doc(id)
    await docRef.update(data)
    res.status(200).send('Document updated successfully')
  } catch (error) {
    console.error('Error updating document:', error)
    res.status(500).send('Error updating document')
  }
})

exports.deleteUserOrAdmin = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).send('Method Not Allowed')
  }

  const { id, collection } = req.body
  if (!id || !collection) {
    return res.status(400).send('Missing parameters')
  }

  try {
    await admin.firestore().collection(collection).doc(id).delete()
    res.status(200).send('Document deleted successfully')
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).send('Error deleting document')
  }
})
