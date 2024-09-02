import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import serviceAccount from '/app/lib/mpeke-beta-firebase-adminsdk-in60y-1f259298f1.json';



if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const auth = admin.auth();

export async function POST(request) {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
        return NextResponse.json({ success: false, message: 'Phone number and OTP are required' }, { status: 400 });
    }

    try {
        const user = await auth.getUserByPhoneNumber(phoneNumber);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ success: false, message: 'Failed to verify OTP' }, { status: 500 });
    }
}
