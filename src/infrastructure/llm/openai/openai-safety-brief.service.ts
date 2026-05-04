import { env } from '../../../config/env';
import type { SafetyBriefLlmInput, SafetyBriefLlmService } from '../../../modules/trip/trip.types';

export class OpenAiSafetyBriefService implements SafetyBriefLlmService {
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

  async generateSafetyBrief(input: SafetyBriefLlmInput): Promise<string> {
    if (!this.endpoint || !this.apiKey || !this.deploymentId || !this.apiVersion) {
      throw new Error('Azure OpenAI is not fully configured');
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), env.AZURE_OPENAI_TIMEOUT_MS);

    const response = await fetch(this.buildChatCompletionsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: env.AZURE_OPENAI_MAX_TOKENS,
        temperature: env.AZURE_OPENAI_TEMPERATURE,
        messages: [
          {
            role: 'system',
            content: [
              'Write a short family-facing travel safety brief.',
              'Use simple language and a reassuring tone.',
              'Use only the data provided.',
              'Do not add local facts, hotel facts, transport facts, or safety claims that are not explicitly present.',
              'If something is missing, say it is not yet available.',
              'Keep the answer to 2 or 3 short sentences.'
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
        `Azure OpenAI request failed with ${response.status}${errorText ? `: ${errorText}` : ''}`
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
    const brief = Array.isArray(firstChoice)
      ? firstChoice
          .map((item) => item.text ?? '')
          .join(' ')
          .trim()
      : firstChoice?.trim();

    if (!brief) {
      throw new Error('Azure OpenAI returned an empty safety brief');
    }

    return brief;
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
