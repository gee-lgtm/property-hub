export interface SmsProvider {
  sendSms(to: string, message: string): Promise<SmsResult>;
  validatePhoneNumber?(phoneNumber: string): boolean;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

export interface SmsConfig {
  provider: 'twilio' | 'vonage' | 'messagebird' | 'console';
  credentials: Record<string, string>;
  defaultFrom?: string;
}