# SMS Service

Pluggable SMS service architecture that supports multiple providers.

## Supported Providers

### 1. Console (Development)
- **Use**: Development/testing
- **Setup**: No credentials needed
- **Cost**: Free (logs to console)

### 2. Twilio (Recommended)
- **Use**: Production
- **Setup**: Get credentials from [Twilio Console](https://console.twilio.com/)
- **Cost**: ~$0.05-0.08 per SMS to Mongolia

### 3. Vonage (Placeholder)
- **Use**: Alternative to Twilio
- **Setup**: Not implemented yet
- **Cost**: ~$0.04-0.06 per SMS to Mongolia

### 4. MessageBird (Placeholder)
- **Use**: Asia-Pacific focused
- **Setup**: Not implemented yet
- **Cost**: ~$0.04-0.06 per SMS to Mongolia

## Configuration

### Environment Variables

```bash
# Provider selection
SMS_PROVIDER="console"  # or "twilio", "vonage", "messagebird"

# Twilio credentials
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"  
TWILIO_FROM_NUMBER="+1234567890"
```

### Usage

```typescript
import { getSmsService } from '@/lib/sms';

const smsService = getSmsService();
const result = await smsService.sendSms('+1234567890', 'Hello world!');
```

## Switching Providers

To switch from console to Twilio:

1. Get Twilio credentials
2. Update `.env.local`:
   ```bash
   SMS_PROVIDER="twilio"
   TWILIO_ACCOUNT_SID="your-account-sid"
   TWILIO_AUTH_TOKEN="your-auth-token"
   TWILIO_FROM_NUMBER="your-twilio-phone-number"
   ```
3. Restart the development server

## Adding New Providers

1. Create provider class in `providers/` directory
2. Implement `SmsProvider` interface
3. Add to factory switch statement
4. Update environment variables