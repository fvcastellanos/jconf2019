import { Request, Response } from 'express';

export class HealthController {

    async getHealth(req: Request, res: Response): Promise<void> {

        res.status(200)
            .json({ 
                status: "UP", 
                storageStatus: "UP"
         });
    }
}

export default new HealthController();