import { SmsProvider, SmsConfig } from './types';
import { TwilioProvider } from './providers/twilio';
import { ConsoleProvider } from './providers/console';
import { VonageProvider } from './providers/vonage';
// import { MessageBirdProvider } from './providers/messagebird';

export function createSmsProvider(config: SmsConfig): SmsProvider {
  switch (config.provider) {
    case 'twilio':
      return new TwilioProvider(
        config.credentials.accountSid,
        config.credentials.authToken,
        config.defaultFrom || config.credentials.fromNumber
      );
    
    case 'vonage':
      return new VonageProvider(
        config.credentials.apiKey || config.credentials.accountSid,
        config.credentials.apiSecret || config.credentials.authToken,
        config.defaultFrom || config.credentials.fromNumber
      );
    
    case 'console':
      return new ConsoleProvider();
    
    default:
      throw new Error(`Unsupported SMS provider: ${config.provider}`);
  }
}

// Singleton SMS service instance
let smsService: SmsProvider | null = null;

export function getSmsService(): SmsProvider {
  if (!smsService) {
    const provider = (process.env.SMS_PROVIDER as 'twilio' | 'vonage' | 'messagebird' | 'console') || 'console';
    
    const config: SmsConfig = {
      provider,
      credentials: {
        // Twilio credentials
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        fromNumber: process.env.TWILIO_FROM_NUMBER || '',
        
        // Vonage credentials
        apiKey: process.env.VONAGE_API_KEY || '',
        apiSecret: process.env.VONAGE_API_SECRET || '',
      },
      defaultFrom: process.env.SMS_FROM_NUMBER || process.env.VONAGE_FROM_NUMBER || process.env.TWILIO_FROM_NUMBER || '',
    };

    smsService = createSmsProvider(config);
  }

  return smsService;
}