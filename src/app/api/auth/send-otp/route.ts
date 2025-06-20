import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSmsService } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove non-digits and add country code if needed)
    const normalizedPhone = phone.replace(/\D/g, '');
    const fullPhone = normalizedPhone.startsWith('1') ? normalizedPhone : `1${normalizedPhone}`;

    // Check rate limiting - prevent spam (bypass in development)
    const existingUser = await prisma.user.findUnique({
      where: { phone: fullPhone }
    });

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Only enforce rate limiting in production
    if (process.env.NODE_ENV === 'production' && existingUser?.lastOtpSent && existingUser.lastOtpSent > fiveMinutesAgo) {
      return NextResponse.json(
        { error: 'Please wait before requesting another OTP' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Update or create user with OTP
    await prisma.user.upsert({
      where: { phone: fullPhone },
      update: {
        otpCode,
        otpExpiry,
        otpAttempts: 0,
        lastOtpSent: now,
      },
      create: {
        phone: fullPhone,
        otpCode,
        otpExpiry,
        otpAttempts: 0,
        lastOtpSent: now,
        phoneVerified: false,
      },
    });

    // Send SMS using configured provider
    const smsService = getSmsService();
    const message = `Your PropertyHub verification code is: ${otpCode}. This code will expire in 10 minutes.`;
    
    const smsResult = await smsService.sendSms(fullPhone, message);
    
    if (!smsResult.success) {
      console.error('Failed to send SMS:', smsResult.error);
      // Don't fail the request if SMS fails - user might retry
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      phone: fullPhone,
      // In development, return OTP for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' && { otp: otpCode })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}