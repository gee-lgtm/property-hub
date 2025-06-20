import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '');
    const fullPhone = normalizedPhone.startsWith('1') ? normalizedPhone : `1${normalizedPhone}`;

    // Find user with phone number
    const user = await prisma.user.findUnique({
      where: { phone: fullPhone }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const now = new Date();
    if (!user.otpExpiry || user.otpExpiry < now) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check attempt limits
    if (user.otpAttempts >= 3) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP' },
        { status: 429 }
      );
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      // Increment failed attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: user.otpAttempts + 1 }
      });

      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - verify user and clear OTP data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        otpCode: null,
        otpExpiry: null,
        otpAttempts: 0,
        lastOtpSent: null,
      }
    });

    // Create JWT token
    const token = await new SignJWT({
      userId: updatedUser.id,
      phone: updatedUser.phone,
      phoneVerified: updatedUser.phoneVerified,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: 'Phone verified successfully',
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        phoneVerified: updatedUser.phoneVerified,
        role: updatedUser.role,
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}