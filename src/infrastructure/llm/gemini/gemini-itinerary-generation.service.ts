import { z } from 'zod';

import { env } from '../../../config/env';
import type {
  GeneratedItineraryLlmOutput,
  ItineraryLlmInput,
  ItineraryLlmService
} from '../../../modules/forher-itinerary/forher-itinerary.types';

const itineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1),
  focus: z.string().min(1),
  items: z
    .array(
      z.object({
        timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        title: z.string().min(1),
        description: z.string().min(1),
        safetyNote: z.string().min(1)
      })
    )
    .length(3)
});

const itineraryResponseSchema = z.object({
  overview: z.string().min(1),
  rationale: z.array(z.string().min(1)).min(3).max(6),
  days: z.array(itineraryDaySchema).min(1)
});

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
const itineraryResponseJsonSchema = {
  type: 'object',
  properties: {
    overview: {
      type: 'string',
      description: 'A short summary of the overall safety-first travel approach.'
    },
    rationale: {
      type: 'array',
      description: 'Short reasons behind the itinerary sequencing.',
      items: {
        type: 'string'
      }
    },
    days: {
      type: 'array',
      description: 'One itinerary object for each requested day.',
      items: {
        type: 'object',
        properties: {
          dayNumber: {
            type: 'integer'
          },
          title: {
            type: 'string'
          },
          focus: {
            type: 'string'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                timeOfDay: {
                  type: 'string',
                  enum: ['Morning', 'Afternoon', 'Evening']
                },
                startTime: {
                  type: 'string'
                },
                endTime: {
                  type: 'string'
                },
                title: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                safetyNote: {
                  type: 'string'
                }
              },
              required: [
                'timeOfDay',
                'startTime',
                'endTime',
                'title',
                'description',
                'safetyNote'
              ]
            }
          }
        },
        required: ['dayNumber', 'title', 'focus', 'items']
      }
    }
  },
  required: ['overview', 'rationale', 'days']
} as const;

export class GeminiItineraryGenerationService implements ItineraryLlmService {
  private readonly apiKey = env.GEMINI_API_KEY;

  async generateItinerary(input: ItineraryLlmInput): Promise<GeneratedItineraryLlmOutput> {
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
                'Generate a safe travel itinerary as JSON only.',
                'Use only the structured trip data provided.',
                'Do not invent venue names, hotel names, neighborhood facts, transport providers, or local claims not present in the input.',
                'Keep the itinerary generic but useful, with daylight-first planning, predictable return windows, and short evening movement.',
                'Return exactly the requested number of days.',
                'For each day, return exactly 3 items in this order: Morning, Afternoon, Evening.'
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
          temperature: 0.5,
          maxOutputTokens: 3200,
          responseMimeType: 'application/json',
          responseJsonSchema: itineraryResponseJsonSchema
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

    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      const blockReason = payload?.promptFeedback?.blockReason;

      throw new Error(
        blockReason
          ? `Gemini did not return itinerary content (${blockReason})`
          : 'Gemini returned an empty itinerary response'
      );
    }

    const parsed = itineraryResponseSchema.parse(this.parseJson(text));

    if (parsed.days.length !== input.numberOfDays) {
      throw new Error(
        `Gemini returned ${parsed.days.length} itinerary days, expected ${input.numberOfDays}`
      );
    }

    return parsed;
  }

  private buildPrompt(input: ItineraryLlmInput): string {
    const tripLines = input.tripTitle
      ? [
          `Trip title: ${input.tripTitle}`,
          `Trip status: ${input.tripStatus ?? 'Not available'}`,
          `Start date: ${input.startDate ?? 'Not available'}`,
          `End date: ${input.endDate ?? 'Not available'}`
        ]
      : ['Trip context: Not linked to an existing trip record'];

    return [
      'Return JSON only with this shape:',
      '{"overview": string, "rationale": string[], "days": [{"dayNumber": number, "title": string, "focus": string, "items": [{"timeOfDay": "Morning" | "Afternoon" | "Evening", "startTime": "HH:MM", "endTime": "HH:MM", "title": string, "description": string, "safetyNote": string}]}]}',
      `Destination: ${input.destination}`,
      `Number of days: ${input.numberOfDays}`,
      `Travellers count: ${input.travelersCount}`,
      ...tripLines,
      'Keep times realistic and in 24-hour HH:MM format.',
      'Do not include markdown fences.'
    ].join('\n');
  }

  private parseJson(text: string): unknown {
    const sanitized = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    try {
      return JSON.parse(sanitized);
    } catch {
      const firstBrace = sanitized.indexOf('{');
      const lastBrace = sanitized.lastIndexOf('}');

      if (firstBrace >= 0 && lastBrace > firstBrace) {
        return JSON.parse(sanitized.slice(firstBrace, lastBrace + 1));
      }

      throw new Error('Gemini returned itinerary content that was not valid JSON');
    }
  }
}
