import { SmsProvider, SmsResult } from '../types';

// Placeholder for MessageBird provider  
// To implement: npm install messagebird
export class MessageBirdProvider implements SmsProvider {
  constructor(private apiKey: string, private fromNumber: string) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendSms(_to: string, _message: string): Promise<SmsResult> {
    // TODO: Implement MessageBird SMS sending
    // const messagebird = require('messagebird')(this.apiKey);
    // const result = await messagebird.messages.create({ originator: this.fromNumber, recipients: [to], body: message });
    
    throw new Error('MessageBird provider not implemented yet');
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}