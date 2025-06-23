import { Vonage } from '@vonage/server-sdk';
import { SmsProvider, SmsResult } from '../types';

export class VonageProvider implements SmsProvider {
  private vonage: Vonage;
  private fromNumber: string;

  constructor(apiKey: string, apiSecret: string, fromNumber: string) {
    // Use any to bypass TypeScript initialization issues with Vonage SDK
    this.vonage = new Vonage({
      apiKey,
      apiSecret,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    this.fromNumber = fromNumber;
  }

  async sendSms(to: string, message: string): Promise<SmsResult> {
    try {
      const result = await this.vonage.sms.send({
        to: to.startsWith('+') ? to : `+${to}`,
        from: this.fromNumber,
        text: message,
      });

      // Vonage returns an array of message results
      if (result.messages && result.messages.length > 0) {
        const firstMessage = result.messages[0];
        
        if (firstMessage.status === '0') {
          // Status '0' means success
          return {
            success: true,
            messageId: firstMessage['message-id'],
            cost: firstMessage['message-price'] ? parseFloat(firstMessage['message-price']) : undefined,
          };
        } else {
          return {
            success: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: `Vonage error: ${(firstMessage as any).errorText || (firstMessage as any)['error-text'] || 'Unknown error'}`,
          };
        }
      } else {
        return {
          success: false,
          error: 'No message results returned from Vonage',
        };
      }
    } catch (error: unknown) {
      console.error('Vonage SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS via Vonage',
      };
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    try {
      const cleaned = phoneNumber.replace(/\D/g, '');
      // Vonage supports international numbers (10-15 digits)
      return cleaned.length >= 10 && cleaned.length <= 15;
    } catch {
      return false;
    }
  }
}