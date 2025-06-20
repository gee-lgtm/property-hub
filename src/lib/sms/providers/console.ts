import { SmsProvider, SmsResult } from '../types';

export class ConsoleProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<SmsResult> {
    console.log('📱 SMS (Console Provider)');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('---');
    
    return {
      success: true,
      messageId: `console_${Date.now()}`,
    };
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}