import 'dotenv/config';

import { z } from 'zod';

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? undefined : trimmedValue;
}, z.string().min(1).optional());

const booleanWithDefault = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === '') {
        return defaultValue;
      }

      if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
        return true;
      }

      if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
        return false;
      }
    }

    return value;
  }, z.boolean().default(defaultValue));

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_NAME: z.string().min(1).default('forher-backend'),
    PORT: z.coerce.number().int().positive().default(4000),
    API_PREFIX: z.string().min(1).default('/api/v1'),
    DATABASE_URL: z.string().url(),
    CORS_ORIGIN: z.string().min(1).default('*'),
    OPENAI_API_KEY: optionalString,
    AZURE_OPENAI_API_KEY: optionalString,
    AZURE_OPENAI_ENDPOINT: optionalString,
    AZURE_OPENAI_API_VERSION: optionalString,
    AZURE_OPENAI_DEPLOYMENT_ID: optionalString,
    AZURE_OPENAI_MODEL: optionalString,
    AZURE_OPENAI_API_TYPE: optionalString,
    AZURE_OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
    AZURE_OPENAI_MAX_TOKENS: z.coerce.number().int().positive().default(150),
    AZURE_OPENAI_ITINERARY_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
    AZURE_OPENAI_ITINERARY_MAX_TOKENS: z.coerce.number().int().positive().default(1800),
    AZURE_OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0),
    AZURE_OPENAI_MAX_RETRIES: z.coerce.number().int().min(0).default(0),
    TWILIO_ACCOUNT_SID: optionalString,
    TWILIO_AUTH_TOKEN: optionalString,
    TWILIO_WHATSAPP_NUMBER: optionalString,
    /** Legacy / alternate name — same value as sandbox "from" WhatsApp number */
    TWILIO_PHONE_NUMBER: optionalString,
    CHECK_IN_SCHEDULER_ENABLED: booleanWithDefault(true),
    CHECK_IN_SCHEDULER_INTERVAL_MS: z.coerce.number().int().positive().default(60000),
    CHECK_IN_SCHEDULER_BATCH_SIZE: z.coerce.number().int().positive().max(250).default(25)
  })
  .transform(({ TWILIO_PHONE_NUMBER, ...rest }) => ({
    ...rest,
    TWILIO_WHATSAPP_NUMBER: rest.TWILIO_WHATSAPP_NUMBER ?? TWILIO_PHONE_NUMBER,
    CHECK_IN_SCHEDULER_ENABLED:
      rest.NODE_ENV === 'test' ? false : rest.CHECK_IN_SCHEDULER_ENABLED
  }));

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
