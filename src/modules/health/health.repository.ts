import type { DependencyStatus } from './health.types';

export interface HealthRepository {
  checkDatabase(): Promise<DependencyStatus>;
}
