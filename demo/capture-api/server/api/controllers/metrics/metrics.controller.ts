import { Request, Response } from 'express';
import metricsClient from '../../../common/metrics';

export class MetricsController {

    async exposeMetrics(req: Request, res: Response): Promise<void> {

        let metrics = metricsClient.register.metrics();
        res.header("Content-Type", "text/plain")
            .status(200).send(metrics);
    }
}

export default new MetricsController();