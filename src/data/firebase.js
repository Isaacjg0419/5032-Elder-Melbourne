// firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth' // 导入Firebase Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDaEyQ5hYpaWNvWFWMPo-7vYYt3_Fb9iRE',
  authDomain: 'db-67c2b.firebaseapp.com',
  projectId: 'db-67c2b',
  storageBucket: 'db-67c2b.appspot.com',
  messagingSenderId: '342994586670',
  appId: '1:342994586670:web:fd463ca18280aea404a3bf',
  measurementId: 'G-G627GEDMKJ'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
