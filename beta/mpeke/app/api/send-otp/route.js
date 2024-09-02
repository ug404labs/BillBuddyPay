

// Initialize Firebase Admin SDK
import serviceAccount from '/app/lib/mpeke-beta-firebase-adminsdk-in60y-1f259298f1.json';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const auth = admin.auth();

export async function POST(request) {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
        return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    try {
        const verificationId = await auth.createCustomToken(phoneNumber);
        return NextResponse.json({ success: true, verificationId });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
    }
}
