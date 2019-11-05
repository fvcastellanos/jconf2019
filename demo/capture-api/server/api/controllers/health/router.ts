import express from 'express';
import healthController from './health.controller';

export default express.Router()
    .get('/', healthController.getHealth)
