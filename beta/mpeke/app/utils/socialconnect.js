// utils/socialconnect.js

import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { ethers } from 'ethers';
import   db  from '../utils/firestone';

export const socialConnect = async (phoneNumber) => {
  console.log("Initializing Firestore...");
  
  const userRef = doc(db, 'users', phoneNumber);
  
  try {
    console.log("Attempting to connect to the database...");

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log(`User with phone number ${phoneNumber} found in the database.`);
      // User exists, return their data
      return userSnap.data();
    } else {
      console.log(`User with phone number ${phoneNumber} not found. Creating new user...`);
      // User doesn't exist, create new user
      const wallet = ethers.Wallet.createRandom();
      const userData = {
        phoneNumber,
        address: wallet.address,
        privateKey: wallet.privateKey, // Be cautious with storing private keys
      };

      console.log(`Generated new wallet with address: ${wallet.address}`);

      // Save user data to Firestore
      await setDoc(userRef, userData);
      console.log(`User data saved to Firestore for phone number ${phoneNumber}.`);

      return userData;
    }
  } catch (error) {
    console.error("Error in socialConnect:", error);
    throw new Error("Failed to connect. Please try again later.");
  }
};
