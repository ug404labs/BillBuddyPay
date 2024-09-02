// helpers/firebaseHelpers.js

// helpers/firebaseHelpers.js

import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { ethers } from 'ethers';

export const socialConnect = async (phoneNumber) => {
  const db = getFirestore();
  const userRef = doc(db, 'users', phoneNumber);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // User exists, return their data
    return userSnap.data();
  } else {
    // User doesn't exist, create new user
    const wallet = ethers.Wallet.createRandom();
    const userData = {
      phoneNumber,
      address: wallet.address,
      privateKey: wallet.privateKey,
    };

    // Save user data to Firestore
    await setDoc(userRef, userData);

    return userData;
  }
};