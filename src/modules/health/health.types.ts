export type DependencyStatus = 'up' | 'down';
export type ServiceStatus = 'ok' | 'degraded';

export interface HealthResponse {
  service: string;
  environment: string;
  status: ServiceStatus;
  timestamp: string;
  uptimeInSeconds: number;
  dependencies: {
    database: DependencyStatus;
  };
}
