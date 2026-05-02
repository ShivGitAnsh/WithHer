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
                'Write a family-facing travel safety brief.',
                'Use simple language and a reassuring tone.',
                'Use only the data provided.',
                'Do not add local facts, hotel facts, transport facts, or safety claims that are not explicitly present.',
                'If something is missing, say it is not yet available.',
                'The output must be exactly 2 or 3 complete sentences.',
                'The total response length must be at least 110 characters.',
                'Return plain text only.',
                'Do not use bullets, headings, markdown, JSON, or labels like "Brief:".'
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
          temperature: 0.35,
          maxOutputTokens: 600,
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

      if (blockReason) {
        throw new Error(`Gemini did not return a safety brief (${blockReason})`);
      }

      throw new Error('Gemini returned an empty safety brief');
    }

    return this.extractBrief(text);
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
    const recentEventsSection =
      input.recentEvents.length > 0
        ? [
            'Recent trip events:',
            ...input.recentEvents.map(
              (event, index) =>
                `${index + 1}. ${event.eventType} | ${event.title} | ${event.description ?? 'No extra description'} | ${event.occurredAt}`
            )
          ].join('\n')
        : 'Recent trip events: None recorded yet';
    const checkInSection =
      input.upcomingCheckIns.length > 0
        ? [
            'Upcoming automated check-ins:',
            ...input.upcomingCheckIns.map(
              (rule, index) =>
                `${index + 1}. ${rule.title} | ${rule.expectedEventType} | expected ${rule.expectedAt} | status ${rule.status} | grace ${rule.graceMinutes} minutes`
            )
          ].join('\n')
        : 'Upcoming automated check-ins: None configured yet';
    const shareScopeSection =
      input.shareScopes.length > 0
        ? input.shareScopes.join(', ')
        : 'None configured yet';

    return [
      'Use only the following trip data.',
      'Write 2 or 3 concise full sentences for a family member.',
      'Sentence 1 should explain the trip window and current state.',
      'Sentence 2 should explain the configured reassurance setup such as guardians, sharing, or check-ins.',
      'Sentence 3, if useful, should mention the latest recorded milestone or clearly say that the trip has not started yet.',
      'Do not stop after one sentence unless the data is completely empty.',
      `Trip title: ${input.tripTitle}`,
      `Destination: ${input.destination}`,
      `Trip status: ${input.tripStatus}`,
      `Start date: ${input.startDate}`,
      `End date: ${input.endDate}`,
      `Trip duration days: ${input.tripDurationDays}`,
      `Active guardian count: ${input.activeGuardianCount}`,
      `Primary guardian relationship: ${input.primaryGuardianRelationship ?? 'Not available'}`,
      `Enabled share scopes: ${shareScopeSection}`,
      latestEventLine,
      recentEventsSection,
      checkInSection
    ].join('\n');
  }

  private extractBrief(text: string): string {
    const sanitized = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .replace(/^brief:\s*/i, '')
      .trim();

    const jsonMatch = sanitized.match(/\{[\s\S]*"brief"\s*:\s*"([\s\S]*?)"[\s\S]*\}/);

    if (jsonMatch?.[1]) {
      return this.normalizeBrief(jsonMatch[1]);
    }

    return this.normalizeBrief(sanitized);
  }

  private normalizeBrief(brief: string): string {
    return brief
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .trim();
  }
}
