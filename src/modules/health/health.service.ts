import { env } from '../../config/env';

import type { HealthRepository } from './health.repository';
import type { HealthResponse, ServiceStatus } from './health.types';

export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async getHealth(): Promise<HealthResponse> {
    const databaseStatus = await this.healthRepository.checkDatabase();
    const status: ServiceStatus = databaseStatus === 'up' ? 'ok' : 'degraded';

    return {
      service: env.APP_NAME,
      environment: env.NODE_ENV,
      status,
      timestamp: new Date().toISOString(),
      uptimeInSeconds: Math.floor(process.uptime()),
      dependencies: {
        database: databaseStatus
      }
    };
  }
}
