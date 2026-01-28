export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  timestamp: string;
  dependencies?: {
    database?: 'ok' | 'down';
  };
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
  return {
    status: 'ok',
    service: 'notes-api',
    timestamp: new Date().toISOString(),
  };
};
