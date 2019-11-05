import { Request, Response } from 'express';
import { SpacesClient } from '../../clients/spaces.client';
import { Spaces } from '../../../common/spaces';

export class HealthController {

    async getHealth(req: Request, res: Response): Promise<void> {

        let spacesClient = new SpacesClient(new Spaces());
        let status: Object;

        await spacesClient.getHealth().then(value => {

            status = { 
                status: "UP", 
                storageStatus: "UP"
            };
        }).catch(err => {

            status = { 
                status: "UP", 
                storageStatus: "DOWN"
            };
        })

        res.status(200)
            .json(status);
    }
}

export default new HealthController();