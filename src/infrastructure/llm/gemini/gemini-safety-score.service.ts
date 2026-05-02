import { z } from 'zod';

import { env } from '../../../config/env';
import type {
  ForHerSafetyScoreResponse,
  SafetyScoreLlmInput,
  SafetyScoreLlmService
} from '../../../modules/forher-safety-score/forher-safety-score.types';

const safetyScoreResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  status: z.enum(['Safe', 'Moderate', 'Risky']),
  reasons: z.array(z.string().min(1)).min(2).max(5)
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
const safetyScoreResponseJsonSchema = {
  type: 'object',
  properties: {
    score: {
      type: 'integer',
      description: 'An integer travel reassurance score from 0 to 100.'
    },
    status: {
      type: 'string',
      enum: ['Safe', 'Moderate', 'Risky']
    },
    reasons: {
      type: 'array',
      description: 'Short reasons grounded only in the provided trip data.',
      items: {
        type: 'string'
      }
    }
  },
  required: ['score', 'status', 'reasons']
} as const;

export class GeminiSafetyScoreService implements SafetyScoreLlmService {
  private readonly apiKey = env.GEMINI_API_KEY;

  async generateSafetyScore(input: SafetyScoreLlmInput): Promise<ForHerSafetyScoreResponse> {
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
                'Assess trip reassurance and operational safety confidence from structured trip data only.',
                'Do not guarantee safety and do not invent missing facts.',
                'Return JSON only.',
                'The score must be an integer from 0 to 100.',
                'Status must follow this mapping: Safe for score 80 or above, Moderate for score 60 to 79, Risky for score below 60.',
                'Reasons should be concise and grounded only in the provided trip status and events.'
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
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseJsonSchema: safetyScoreResponseJsonSchema,
          thinkingConfig: {
            thinkingBudget: 0
          }
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
          ? `Gemini did not return safety-score content (${blockReason})`
          : 'Gemini returned an empty safety-score response'
      );
    }

    const parsed = safetyScoreResponseSchema.parse(this.parseJson(text));

    return {
      score: parsed.score,
      status: this.statusFromScore(parsed.score),
      reasons: parsed.reasons,
      fallbackUsed: false
    };
  }

  private buildPrompt(input: SafetyScoreLlmInput): string {
    return [
      'Return JSON only with this shape:',
      '{"score": number, "status": "Safe" | "Moderate" | "Risky", "reasons": string[]}',
      `Trip id: ${input.tripId}`,
      `Trip title: ${input.tripTitle ?? 'Not available'}`,
      `Destination: ${input.destination ?? 'Not available'}`,
      `Trip status: ${input.tripStatus}`,
      `Start date: ${input.startDate}`,
      `End date: ${input.endDate}`,
      `Latest event: ${input.latestEvent ? `${input.latestEvent.eventType} | ${input.latestEvent.title} | ${input.latestEvent.occurredAt}` : 'Not available'}`,
      `Latest check-in: ${input.latestCheckIn ? `${input.latestCheckIn.eventType} | ${input.latestCheckIn.title} | ${input.latestCheckIn.occurredAt}` : 'Not available'}`,
      'Recent events:',
      ...input.recentEvents.map(
        (event, index) =>
          `${index + 1}. ${event.eventType} | ${event.title} | ${event.occurredAt}`
      ),
      'Base the result on recency, continuity of updates, presence of recent check-ins, and any late-night arrival-related patterns visible in the data.',
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
        try {
          return JSON.parse(sanitized.slice(firstBrace, lastBrace + 1));
        } catch {
          // fall through to truncation repair
        }
      }

      const repaired = this.repairTruncatedJson(sanitized.slice(firstBrace >= 0 ? firstBrace : 0));

      if (repaired) {
        return repaired;
      }

      throw new Error('Gemini returned safety-score content that was not valid JSON');
    }
  }

  /**
   * Best-effort recovery when Gemini truncates the JSON mid-array. Pulls the
   * already-emitted score, status, and any complete reason strings so a partial
   * answer is preferred over a fallback.
   */
  private repairTruncatedJson(text: string): { score: number; status: string; reasons: string[] } | null {
    const scoreMatch = text.match(/"score"\s*:\s*(-?\d+)/);
    const statusMatch = text.match(/"status"\s*:\s*"(Safe|Moderate|Risky)"/);

    if (!scoreMatch || !statusMatch) {
      return null;
    }

    const reasons: string[] = [];
    const reasonRegex = /"((?:[^"\\]|\\.)*)"/g;
    const reasonsBlock = text.match(/"reasons"\s*:\s*\[([\s\S]*)$/);

    if (reasonsBlock?.[1]) {
      let match: RegExpExecArray | null;

      while ((match = reasonRegex.exec(reasonsBlock[1])) !== null) {
        const value = match[1].trim();

        if (value.length > 0) {
          reasons.push(value);
        }
      }
    }

    if (reasons.length < 2) {
      return null;
    }

    return {
      score: Number(scoreMatch[1]),
      status: statusMatch[1],
      reasons: reasons.slice(0, 5)
    };
  }

  private statusFromScore(score: number): 'Safe' | 'Moderate' | 'Risky' {
    if (score >= 80) {
      return 'Safe';
    }

    if (score >= 60) {
      return 'Moderate';
    }

    return 'Risky';
  }
}
