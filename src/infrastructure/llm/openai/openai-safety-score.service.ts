import { env } from '../../../config/env';
import type {
  SafetyScoreLlmInput,
  SafetyScoreLlmOutput,
  SafetyScoreLlmService
} from '../../../modules/forher-safety-score/forher-safety-score.types';
import { llmSafetyScoreOutputSchema } from '../../../modules/forher-safety-score/forher-safety-score.types';

export class OpenAiSafetyScoreService implements SafetyScoreLlmService {
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

  async generateSafetyScore(input: SafetyScoreLlmInput): Promise<SafetyScoreLlmOutput> {
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
        max_tokens: Math.max(env.AZURE_OPENAI_MAX_TOKENS, 220),
        temperature: env.AZURE_OPENAI_TEMPERATURE,
        response_format: {
          type: 'json_object'
        },
        messages: [
          {
            role: 'system',
            content: [
              'You are evaluating travel safety for a solo-women travel product.',
              'Use only the women traveller reviews provided in the prompt.',
              'Do not use external knowledge about the destination.',
              'Return only valid JSON with keys: score and reasons.',
              'score must be an integer from 0 to 100.',
              'reasons must be an array of 2 to 4 short strings.',
              'Score higher when reviews suggest reliable transport, responsive staff, active surroundings, and comfortable solo movement.',
              'Score lower when reviews mention isolation after dark, improvised transport, weak support, or discomfort for solo women.',
              'Be conservative when the reviews are mixed.'
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
        `Azure OpenAI safety score request failed with ${response.status}${errorText ? `: ${errorText}` : ''}`
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
      throw new Error('Azure OpenAI returned an empty safety score response');
    }

    const parsed = this.parseJson(rawContent);
    const output = llmSafetyScoreOutputSchema.parse(parsed);

    return {
      score: output.score,
      reasons: output.reasons.map((reason) => reason.trim()).filter(Boolean)
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

  private buildPrompt(input: SafetyScoreLlmInput): string {
    const serializedReviews = input.reviews
      .map((review, index) =>
        [
          `Review ${index + 1}:`,
          `Reviewer: ${review.reviewerLabel}`,
          `Travel context: ${review.travelContext}`,
          `Sentiment: ${review.sentiment}`,
          `Rating: ${review.rating}/5`,
          `Review text: ${review.review}`,
          `Tags: ${review.tags.join(', ')}`
        ].join('\n')
      )
      .join('\n\n');

    return [
      'Evaluate the likely safety perception using only these reviews.',
      `Trip title: ${input.tripTitle}`,
      `Destination: ${input.destination}`,
      `Trip status: ${input.tripStatus}`,
      `Trip window: ${input.startDate} to ${input.endDate}`,
      `Review set: ${input.reviewSetLabel}`,
      '',
      serializedReviews,
      '',
      'Return only JSON.'
    ].join('\n');
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

      throw new Error('Azure OpenAI safety score response was not valid JSON');
    }
  }
}
