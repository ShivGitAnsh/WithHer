import OpenAI from 'openai';

import { env } from '../../../config/env';
import type { SafetyBriefLlmInput, SafetyBriefLlmService } from '../../../modules/trip/trip.types';

export class OpenAiSafetyBriefService implements SafetyBriefLlmService {
  private readonly client: OpenAI | null;

  constructor() {
    this.client = env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
      : null;
  }

  async generateSafetyBrief(input: SafetyBriefLlmInput): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await this.client.responses.create({
      model: 'gpt-5',
      instructions: [
        'Write a short family-facing travel safety brief.',
        'Use simple language and a reassuring tone.',
        'Use only the data provided.',
        'Do not add local facts, hotel facts, transport facts, or safety claims that are not explicitly present.',
        'If something is missing, say it is not yet available.',
        'Keep the answer to 2 or 3 short sentences.'
      ].join(' '),
      input: this.buildPrompt(input)
    });

    const brief = response.output_text?.trim();

    if (!brief) {
      throw new Error('OpenAI returned an empty safety brief');
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
