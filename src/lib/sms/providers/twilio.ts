import { Twilio } from 'twilio';
import { SmsProvider, SmsResult } from '../types';

export class TwilioProvider implements SmsProvider {
  private client: Twilio;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.client = new Twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async sendSms(to: string, message: string): Promise<SmsResult> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to.startsWith('+') ? to : `+${to}`,
      });

      return {
        success: true,
        messageId: result.sid,
        cost: result.price ? parseFloat(result.price) : undefined,
      };
    } catch (error: unknown) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      };
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    try {
      // Twilio's phone number validation
      const cleaned = phoneNumber.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    } catch {
      return false;
    }
  }
}