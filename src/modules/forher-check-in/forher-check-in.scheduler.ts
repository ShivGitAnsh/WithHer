import { logger } from '../../config/logger';

import type { ForHerCheckInService } from './forher-check-in.service';

interface ForHerCheckInSchedulerOptions {
  enabled: boolean;
  intervalMs: number;
  batchSize: number;
}

export class ForHerCheckInScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private activeRun: Promise<void> | null = null;

  constructor(
    private readonly service: ForHerCheckInService,
    private readonly options: ForHerCheckInSchedulerOptions
  ) {}

  start(): void {
    if (!this.options.enabled) {
      logger.info('Background check-in scheduler is disabled');
      return;
    }

    if (this.timer) {
      return;
    }

    logger.info(
      {
        intervalMs: this.options.intervalMs,
        batchSize: this.options.batchSize
      },
      'Starting background check-in scheduler'
    );

    void this.runCycle('startup');

    this.timer = setInterval(() => {
      void this.runCycle('interval');
    }, this.options.intervalMs);

    this.timer.unref();
  }

  async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.activeRun) {
      await this.activeRun;
    }
  }

  private async runCycle(trigger: 'startup' | 'interval'): Promise<void> {
    if (this.isRunning) {
      logger.warn({ trigger }, 'Skipping check-in scheduler cycle because a previous run is still active');
      return;
    }

    this.isRunning = true;
    this.activeRun = this.execute(trigger).finally(() => {
      this.isRunning = false;
      this.activeRun = null;
    });

    await this.activeRun;
  }

  private async execute(trigger: 'startup' | 'interval'): Promise<void> {
    const startedAt = Date.now();
    const summary = await this.service.evaluateDueRules(this.options.batchSize);
    const durationMs = Date.now() - startedAt;

    if (summary.scanned === 0) {
      logger.debug({ trigger, durationMs }, 'Background check-in scheduler found no due rules');
      return;
    }

    logger.info(
      {
        trigger,
        durationMs,
        ...summary
      },
      'Background check-in scheduler cycle completed'
    );
  }
}
