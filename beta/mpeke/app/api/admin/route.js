// pages/api/admin.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
const serviceAccount = require('../utils/mpeke-beta-firebase-adminsdk-in60y-1f259298f1.json');
if (!initializeApp.length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { uid, customClaims } = req.body;
      await getAuth().setCustomUserClaims(uid, customClaims);
      res.status(200).json({ message: 'Custom claims set successfully' });
    } catch (error) {
      console.error('Error setting custom claims:', error);
      res.status(500).json({ error: 'Failed to set custom claims' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}