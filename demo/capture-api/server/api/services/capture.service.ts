import puppeteer from 'puppeteer';
import logger from '../../common/logger'
import { SpacesClient } from '../clients/spaces.client';

export class CaptureService {

    private readonly spacesClient: SpacesClient;

    constructor(client: SpacesClient) {

        this.spacesClient = client;
    }

    async captureUrl(url: string) : Promise<string> {

        let puppeteerOptions = { 
            ignoreHTTPSErrors: true,
            executablePath: '/usr/bin/chromium-browser',
            args: [
                // Required for Docker version of Puppeteer
                // '--no-sandbox',
                // '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage'
            ]            
        };
        
        let targetUrl = "";

        await puppeteer.launch(puppeteerOptions).then(async browser => {
    
            logger.info(`staring to capture url=${url}`)
            const page = await browser.newPage();

            await page.setViewport({
                width: 1280,
                height: 1080,
                deviceScaleFactor: 1
            });

            await page.goto(url).then(async response => {

                let screenShotOptions = {
                    encoding: 'binary',
                    fullPage: true, 
                    type: 'jpeg',
                    quality: 80
                };

                await page.screenshot(screenShotOptions)
                    .then(async value => {

                        await this.spacesClient.uploadContent(value)
                            .then(async value => {

                                logger.info(`url=${url}, captured`)

                                targetUrl = value;

                            }).catch(error => {

                                logger.error(`can't upload generated image from url=${url}`);
                                throw new Error(`can't upload generated image from url=${url}`);

                            });                            
                    }).catch(error => {

                        logger.error(`can't create a snapshot from url=${url}, error="${error}"`);
                        throw new Error(`can't create a snapshot from url=${url}`);
                    });

            }).catch(error => {

                logger.error(`can't open url=${url}, error="${error}"`);
                throw new Error(`can't open url: ${url}`);
            });

            await browser.close();
            
        }).catch(error => {

            logger.error(`can't process url: ${error}`);
            throw new Error(`headless browser can't process url=${url}`);
        });

        return targetUrl;
    }
}