import express from 'express';
import metricsController from './metrics.controller';

export default express.Router()
    .get('/', metricsController.exposeMetrics)
