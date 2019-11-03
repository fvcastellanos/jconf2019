import AWS from 'aws-sdk';
import { Spaces } from '../../common/spaces';
import logger from '../../common/logger'
import metricsClient from '../../common/metrics';

const uploadGauge = new metricsClient.Gauge({
    name: "capture_api_upload_gauge",
    help: "image upload stats",
    labelNames: ["status"]
});

export class SpacesClient {

    private readonly spacesConfig : Spaces;

    constructor(config: Spaces) {
        this.spacesConfig = config;
    }

    async uploadContent(buffer: Buffer) : Promise<string> {

        let end = uploadGauge.startTimer();

        const uuidv1 = require('uuid/v1');

        logger.info(`loading spaces configuration`);        
        logger.info(`spaces_config=${this.spacesConfig.spacesEndpoint}, ${this.spacesConfig.baseDirectory}, ${this.spacesConfig.bucket}`);

        const spacesEndpoint = new AWS.Endpoint(this.spacesConfig.spacesEndpoint);

        const s3 = new AWS.S3({
          endpoint: spacesEndpoint.href,
          accessKeyId: this.spacesConfig.clientId,
          secretAccessKey: this.spacesConfig.secret
        });
        
        let fileName : string = this.spacesConfig.baseDirectory + uuidv1() + '.jpg';
        logger.info(`fileName=${fileName} generated`);

        let objectParams: AWS.S3.PutObjectRequest = {
            ACL: "public-read",
            Bucket: this.spacesConfig.bucket,
            Key: fileName,
            ContentLength: buffer.byteLength,
            ContentType: 'image/jpeg',
            Body: buffer
        };

        await s3.putObject(objectParams).promise()
            .then(async () => {

                end({ status: "success" });
                logger.info(`object=${objectParams.Key} uploaded`);
                
            }).catch(error => {

                end({ status: "failure" });
                logger.error(`can't upload object=${objectParams}, error=${error}`);                
                throw new Error(`can't upload object: ${objectParams}`);
            });
     
        return fileName;
    }

}