import logger from '../../../common/logger'
import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

// const puppeteer = require('puppeteer');

export class CaptureController {

    captureWeb(req: Request, res: Response): void {
        puppeteer.launch().then(async browser => {

            let url = req.body.url;
    
            const page = await browser.newPage();

            page.on('load', () => logger.info(`URL ${url} loaded...`));

            await page.setViewport({
                width: 1280,
                height: 1080,
                deviceScaleFactor: 1
            });
            await page.goto(url);
            await page.screenshot({path: '/Users/fcastellanos/example.png', fullPage: true});
            await browser.close();
    
        }).catch(error => {
            logger.error(`can't process url: ${error}`);
        });
    }
}

export default new CaptureController();