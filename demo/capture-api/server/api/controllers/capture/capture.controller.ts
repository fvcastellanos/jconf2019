import puppeteer from 'puppeteer';
import logger from '../../../common/logger'
import { Request, Response } from 'express';
import { ErrorResponse } from '../../domain/views/error.response';
import { CaptureResponse } from '../../domain/views/capture.response';

export class CaptureController {

    captureWeb(req: Request, res: Response): void {

        let puppeteerOptions = { ignoreHTTPSErrors: true };
        let url = req.body.url;

        puppeteer.launch(puppeteerOptions).then(async browser => {
    
            logger.info(`received capture request for url=${url}`)
            const page = await browser.newPage();

            page.on('load', () => logger.info(`url=${url} loaded...`));

            await page.setViewport({
                width: 1280,
                height: 1080,
                deviceScaleFactor: 1
            });

            await page.goto(url).then(async response => {

                let screenShotOptions = {
                    path: '/home/fvcg/example.jpg', 
                    fullPage: true, 
                    type: 'jpeg',
                    quality: 90
                };

                await page.screenshot(screenShotOptions)
                    .then(value => {

                        let successResponse : CaptureResponse = {
                            requestId: "",
                            targetUrl: url,
                            storedPath: ""
                        };

                        logger.info(`url=${url}, captured`)
                        res.status(200).json(successResponse);   

                    }).catch(error => {

                        logger.error(`can't create a snapshot from url=${url}, error="${error}"`)
                        res.status(422).json(new ErrorResponse(`can't create a snapshot from url: ${url}`));
                    })

            }).catch(error => {

                logger.error(`can't open url=${url}, error="${error}"`);
                res.status(400).json(new ErrorResponse(`can't open url: ${url}`))

            });

            await browser.close();
            
        }).catch(error => {

            logger.error(`can't process url: ${error}`);
            res.status(500).json(new ErrorResponse(`can't launch headless browser to process url=${url}`))
        });
    }

    buildErrorResponse(error: string): ErrorResponse {

        return new ErrorResponse(error);
    }
}

export default new CaptureController();