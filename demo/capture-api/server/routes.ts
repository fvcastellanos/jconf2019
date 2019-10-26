import { Application } from 'express';
import examplesRouter from './api/controllers/examples/router'
import captureRouter from './api/controllers/capture/router'

export default function routes(app: Application): void {
  app.use('/capture/v1/examples', examplesRouter);
  app.use('/capture/v1', captureRouter)
};