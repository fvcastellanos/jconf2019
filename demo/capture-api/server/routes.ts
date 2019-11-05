import { Application } from 'express';
import captureRouter from './api/controllers/capture/router';
import metricsRouter from './api/controllers/metrics/router';
import healthRouter from './api/controllers/health/router';

export default function routes(app: Application): void {
  app.use('/capture/v1/metrics', metricsRouter)
  app.use('/capture/v1/health', healthRouter)
  app.use('/capture/v1', captureRouter)
};