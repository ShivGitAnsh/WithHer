import 'dotenv/config';

import { z } from 'zod';

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? undefined : trimmedValue;
}, z.string().min(1).optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_NAME: z.string().min(1).default('forher-backend'),
    PORT: z.coerce.number().int().positive().default(4000),
    API_PREFIX: z.string().min(1).default('/api/v1'),
    DATABASE_URL: z.string().url(),
    CORS_ORIGIN: z.string().min(1).default('*'),
    OPENAI_API_KEY: optionalString,
    TWILIO_ACCOUNT_SID: optionalString,
    TWILIO_AUTH_TOKEN: optionalString,
    TWILIO_WHATSAPP_NUMBER: optionalString,
    /** Legacy / alternate name — same value as sandbox "from" WhatsApp number */
    TWILIO_PHONE_NUMBER: optionalString
  })
  .transform(({ TWILIO_PHONE_NUMBER, ...rest }) => ({
    ...rest,
    TWILIO_WHATSAPP_NUMBER: rest.TWILIO_WHATSAPP_NUMBER ?? TWILIO_PHONE_NUMBER
  }));

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
