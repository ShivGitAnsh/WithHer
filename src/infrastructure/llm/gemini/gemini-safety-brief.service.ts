import { env } from '../../../config/env';
import type {
  SafetyBriefLlmInput,
  SafetyBriefLlmService
} from '../../../modules/trip/trip.types';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
  };
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class GeminiSafetyBriefService implements SafetyBriefLlmService {
  private readonly apiKey = env.GEMINI_API_KEY;

  async generateSafetyBrief(input: SafetyBriefLlmInput): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: [
                'Write a short family-facing travel safety brief.',
                'Use simple language and a reassuring tone.',
                'Use only the data provided.',
                'Do not add local facts, hotel facts, transport facts, or safety claims that are not explicitly present.',
                'If something is missing, say it is not yet available.',
                'Keep the answer to 2 or 3 short sentences.'
              ].join(' ')
            }
          ]
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: this.buildPrompt(input)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 140
        }
      })
    });

    const payload = (await response.json().catch(() => null)) as GeminiGenerateContentResponse | null;

    if (!response.ok) {
      throw new Error(
        payload?.error?.message ??
          `Gemini request failed with status ${response.status}`
      );
    }

    const brief = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!brief) {
      const blockReason = payload?.promptFeedback?.blockReason;

      if (blockReason) {
        throw new Error(`Gemini did not return a safety brief (${blockReason})`);
      }

      throw new Error('Gemini returned an empty safety brief');
    }

    return brief;
  }

  private buildPrompt(input: SafetyBriefLlmInput): string {
    const latestEventLine = input.latestEvent
      ? [
          `Latest event type: ${input.latestEvent.eventType}`,
          `Latest event title: ${input.latestEvent.title}`,
          `Latest event description: ${input.latestEvent.description ?? 'Not available'}`,
          `Latest event timestamp: ${input.latestEvent.occurredAt}`
        ].join('\n')
      : 'Latest event: Not yet available';

    return [
      'Use only the following trip data.',
      `Trip title: ${input.tripTitle}`,
      `Destination: ${input.destination}`,
      `Trip status: ${input.tripStatus}`,
      `Start date: ${input.startDate}`,
      `End date: ${input.endDate}`,
      latestEventLine
    ].join('\n');
  }
}
