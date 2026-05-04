import { env } from '../../../config/env';
import type {
  ItineraryLlmInput,
  ItineraryLlmOutput,
  ItineraryLlmService
} from '../../../modules/forher-itinerary/forher-itinerary.types';
import { storedItineraryPayloadSchema } from '../../../modules/forher-itinerary/forher-itinerary.types';

export class OpenAiItineraryService implements ItineraryLlmService {
  private readonly endpoint: string | null;
  private readonly apiKey: string | null;
  private readonly deploymentId: string | null;
  private readonly apiVersion: string | null;
  private readonly model: string;

  constructor() {
    this.endpoint = env.AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, '') ?? null;
    this.apiKey = env.AZURE_OPENAI_API_KEY ?? null;
    this.deploymentId = env.AZURE_OPENAI_DEPLOYMENT_ID ?? null;
    this.apiVersion = env.AZURE_OPENAI_API_VERSION ?? null;
    this.model = env.AZURE_OPENAI_MODEL ?? env.AZURE_OPENAI_DEPLOYMENT_ID ?? 'gpt-4o-mini';
  }

  async generateItinerary(input: ItineraryLlmInput): Promise<ItineraryLlmOutput> {
    if (!this.endpoint || !this.apiKey || !this.deploymentId || !this.apiVersion) {
      throw new Error('Azure OpenAI is not fully configured');
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(
      () => controller.abort(),
      env.AZURE_OPENAI_ITINERARY_TIMEOUT_MS
    );

    const response = await fetch(this.buildChatCompletionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.resolveMaxTokens(input.numberOfDays),
        temperature: env.AZURE_OPENAI_TEMPERATURE,
        response_format: {
          type: 'json_object'
        },
        messages: [
          {
            role: 'system',
            content: [
              'You are generating a safe travel itinerary for a solo-travel safety product.',
              'Return only valid JSON with keys: title, overview, generatedPlan.',
              'generatedPlan must contain rationale and days.',
              'Each day must contain dayNumber, title, focus, and items.',
              'Each item must contain timeOfDay, startTime, endTime, title, description, and safetyNote.',
              'Use only Morning, Afternoon, or Evening for timeOfDay.',
              'Keep output compact: exactly 3 itinerary items per day and at most 3 rationale points.',
              'Each description and safetyNote must be one concise sentence.',
              'Keep movement daylight-first, evening blocks shorter, and routes predictable.',
              'Do not invent hotel names, attractions, neighborhoods, or transport providers.',
              'If trip details are limited, stay generic and say so implicitly through cautious wording.'
            ].join(' ')
          },
          {
            role: 'user',
            content: this.buildPrompt(input)
          }
        ]
      }),
      signal: controller.signal
    }).finally(() => {
      clearTimeout(timeoutHandle);
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Azure OpenAI itinerary request failed with ${response.status}${errorText ? `: ${errorText}` : ''}`
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    };

    const firstChoice = payload.choices?.[0]?.message?.content;
    const rawContent = Array.isArray(firstChoice)
      ? firstChoice
          .map((item) => item.text ?? '')
          .join(' ')
          .trim()
      : firstChoice?.trim();

    if (!rawContent) {
      throw new Error('Azure OpenAI returned an empty itinerary response');
    }

    const parsed = this.parseJson(rawContent) as {
      title?: unknown;
      overview?: unknown;
      generatedPlan?: unknown;
    };

    if (typeof parsed.title !== 'string' || parsed.title.trim().length === 0) {
      throw new Error('Azure OpenAI itinerary response is missing title');
    }

    if (typeof parsed.overview !== 'string' || parsed.overview.trim().length === 0) {
      throw new Error('Azure OpenAI itinerary response is missing overview');
    }

    const generatedPlan = storedItineraryPayloadSchema.parse(parsed.generatedPlan);

    return {
      title: parsed.title.trim(),
      overview: parsed.overview.trim(),
      generatedPlan
    };
  }

  private buildChatCompletionsUrl(): string {
    return [
      this.endpoint,
      '/openai/deployments/',
      this.deploymentId,
      '/chat/completions?api-version=',
      this.apiVersion
    ].join('');
  }

  private buildPrompt(input: ItineraryLlmInput): string {
    return [
      'Create a safe itinerary using only the following information.',
      `Destination: ${input.destination}`,
      `Trip title: ${input.tripTitle ?? 'Not provided'}`,
      `Trip status: ${input.tripStatus ?? 'Not provided'}`,
      `Start date: ${input.startDate ?? 'Not provided'}`,
      `End date: ${input.endDate ?? 'Not provided'}`,
      `Number of days: ${input.numberOfDays}`,
      `Travellers count: ${input.travelersCount}`,
      'Keep the wording concise and avoid unnecessary detail.',
      'Return only JSON.'
    ].join('\n');
  }

  private resolveMaxTokens(numberOfDays: number): number {
    const computedFloor = numberOfDays * 260 + 220;

    return Math.min(Math.max(env.AZURE_OPENAI_ITINERARY_MAX_TOKENS, computedFloor), 2400);
  }

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');

      if (firstBrace >= 0 && lastBrace > firstBrace) {
        return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
      }

      throw new Error('Azure OpenAI itinerary response was not valid JSON');
    }
  }
}
