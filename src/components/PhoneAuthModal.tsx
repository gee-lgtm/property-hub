'use client';

import { useState } from 'react';
import { X, Phone, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import mn from '@/lib/translations';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function PhoneAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = mn.auth.signInWithPhone,
  subtitle = mn.auth.createAccount
}: PhoneAuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { sendOtp, login } = useAuth();

  if (!isOpen) return null;

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits first
    const cleaned = value.replace(/\D/g, '');
    
    // Handle different input scenarios for Mongolian numbers
    if (cleaned.length === 0) return '';
    
    // If user starts typing 976 (country code without +)
    if (cleaned.startsWith('976')) {
      const number = cleaned.substring(3);
      if (number.length === 0) return '976 ';
      if (number.length <= 4) return `976 ${number}`;
      if (number.length <= 8) return `976 ${number.substring(0, 4)} ${number.substring(4)}`;
      return `976 ${number.substring(0, 4)} ${number.substring(4, 8)}`;
    }
    
    // Handle 8-digit Mongolian mobile numbers (without country code)
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
    
    // Limit to 8 digits for domestic format
    const truncated = cleaned.substring(0, 8);
    return `${truncated.substring(0, 4)} ${truncated.substring(4)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate Mongolian phone numbers
    let formattedPhone = '';
    
    if (cleanPhone.length === 8) {
      // 8-digit domestic number, add country code
      formattedPhone = `+976${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('976')) {
      // Full number with country code (without +)
      formattedPhone = `+${cleanPhone}`;
    } else {
      setError(mn.auth.invalidPhoneNumber);
      return;
    }

    setLoading(true);
    setError('');

    const result = await sendOtp(formattedPhone);
    
    if (result.success) {
      setStep('otp');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error || mn.auth.failedToSend);
    }
    
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (otp.length !== 6) {
      setError(mn.auth.enterSixDigitCode);
      return;
    }

    setLoading(true);
    setError('');

    // Format the phone number the same way as in handlePhoneSubmit
    const cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone = '';
    
    if (cleanPhone.length === 8) {
      formattedPhone = `+976${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('976')) {
      formattedPhone = `+${cleanPhone}`;
    } else {
      // Fallback, shouldn't happen if validation worked
      formattedPhone = phone;
    }
    
    const result = await login(formattedPhone, otp);
    
    if (result.success) {
      onSuccess?.();
      onClose();
      resetForm();
    } else {
      setError(result.error || mn.auth.invalidCode);
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setCountdown(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    const result = await sendOtp(phone.replace(/\D/g, ''));
    
    if (result.success) {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error || mn.auth.failedToResend);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {step === 'phone' ? (
              <Phone className="w-6 h-6 text-blue-600" />
            ) : (
              <Shield className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'phone' ? title : mn.auth.enterVerificationCode}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'phone' ? subtitle : `${mn.auth.sentTo} ${formatPhoneNumber(phone)}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.auth.mongolianMobileNumber}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder={mn.auth.phonePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={16}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {mn.auth.phoneHelper}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? mn.auth.sending : mn.auth.sendVerificationCode}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.auth.verificationCode}
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? mn.auth.verifying : mn.auth.verifyCode}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={countdown > 0}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `${mn.auth.resendIn} ${countdown}${mn.auth.seconds}` : mn.auth.resendCode}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {mn.auth.changePhoneNumber}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}