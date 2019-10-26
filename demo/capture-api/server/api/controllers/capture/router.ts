import express from 'express';
import captureController from './capture.controller'

export default express.Router()
    .post('/', captureController.captureWeb)
