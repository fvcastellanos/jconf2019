import puppeteer from 'puppeteer';
import logger from '../../common/logger'
import { SpacesClient } from '../clients/spaces.client';
import metricsClient from '../../common/metrics';

const captureCount = new metricsClient.Counter({
    name: "capture_api_capture_count",
    help: "URL capture count",
    labelNames: ["status", "url"]
});

export class CaptureService {

    private readonly spacesClient: SpacesClient;

    constructor(client: SpacesClient) {

        this.spacesClient = client;
    }

    async captureUrl(url: string) : Promise<string> {

        let puppeteerOptions = null;

        await this.buildPuppeteerOptions().then(value => {
            puppeteerOptions = value;
        })
        
        let targetUrl = "";

        await puppeteer.launch(puppeteerOptions).then(async browser => {
    
            logger.info(`staring to capture url=${url}`)
            const page = await browser.newPage();

            await page.setViewport({
                width: 1280,
                height: 1080,
                deviceScaleFactor: 1
            });

            await page.goto(url, { waitUntil: 'load', timeout: 60000 }).then(async response => {

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

                                captureCount.inc({ status: "success", url: url });
                                logger.info(`url=${url}, captured`)

                                targetUrl = value;

                            }).catch(error => {

                                captureCount.inc({ status: "failure", url: url });
                                logger.error(`can't upload generated image from url=${url}, error=${error}`);
                                throw new Error(`can't upload generated image from url=${url}`);

                            });                            
                    }).catch(error => {

                        captureCount.inc({ status: "failure", url: url });
                        logger.error(`can't create a snapshot from url=${url}, error="${error}"`);
                        throw new Error(`can't create a snapshot from url=${url}`);
                    });

            }).catch(error => {

                captureCount.inc({ status: "failure", url: url });
                logger.error(`can't open url=${url}, error="${error}"`);
                throw new Error(`can't open url: ${url}`);
            }).finally(async () => {

                await browser.close();
            });
            
        }).catch(error => {

            captureCount.inc({ status: "failure", url: url });
            logger.error(`can't process url: ${error}`);
            throw new Error(`headless browser can't process url=${url}`);
        });

        return targetUrl;
    }

    private async buildPuppeteerOptions(): Promise<object> {

        let environment = process.env.NODE_ENV;
        logger.info(`using configuration for environment=${environment}`);

        if (environment == 'prod') {

            return {
                ignoreHTTPSErrors: true,
                executablePath: 'google-chrome-unstable',
                args: [
                    // Required for Docker version of Puppeteer
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    // This will write shared memory files into /tmp instead of /dev/shm,
                    // because Docker’s default for /dev/shm is 64MB
                    '--disable-dev-shm-usage'
                ]            
            };
        }

        return {
            ignoreHTTPSErrors: true,
            args: [
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage'
            ]            
        }
    }

}