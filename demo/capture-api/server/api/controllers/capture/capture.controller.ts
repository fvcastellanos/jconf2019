import logger from '../../../common/logger'
import { Request, Response } from 'express';
import { ErrorResponse } from '../../domain/views/error.response';
import { CaptureResponse } from '../../domain/views/capture.response';
import { SpacesClient } from '../../clients/spaces.client';
import { Spaces } from '../../../common/spaces';
import { CaptureService } from '../../services/capture.service';

export class CaptureController {

    async captureWeb(req: Request, res: Response): Promise<void> {
    
        let url = req.body.url;
        let requestId = req.body.requestId;

        try {

            let spacesClient: SpacesClient = new SpacesClient(new Spaces());
            let captureService: CaptureService = new CaptureService(spacesClient);
        
            await captureService.captureUrl(url).then(async file => {
    
                let successResponse : CaptureResponse = {
                    requestId: requestId,
                    targetUrl: url,
                    storedPath: "https://cdn.cavitos.net/" + file
                };
    
                logger.info(`url=${url}, captured`)
                res.status(200).json(successResponse);   
    
            }).catch(error => {
    
                logger.error(`can't capture url=${url}, error="${error}"`);
                res.status(422).json(new ErrorResponse(requestId, error.message));
            })
    
        } catch(ex) {

            logger.error(`something went wrong when capturing url=${url} -`, ex);
            res.status(500).json(new ErrorResponse(requestId, ex.message));
        }
    }
}

export default new CaptureController();