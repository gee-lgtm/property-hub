import { SmsProvider, SmsResult } from '../types';

// Placeholder for Vonage provider
// To implement: npm install @vonage/server-sdk
export class VonageProvider implements SmsProvider {
  constructor(private apiKey: string, private apiSecret: string, private fromNumber: string) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendSms(_to: string, _message: string): Promise<SmsResult> {
    // TODO: Implement Vonage SMS sending
    // const vonage = new Vonage({ apiKey: this.apiKey, apiSecret: this.apiSecret });
    // const result = await vonage.sms.send({ to, from: this.fromNumber, text: message });
    
    throw new Error('Vonage provider not implemented yet');
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}