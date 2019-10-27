import AWS from 'aws-sdk';
import { Spaces } from '../../common/spaces';
import logger from '../../common/logger'

export class SpacesClient {

    private readonly spacesConfig : Spaces;

    constructor(config: Spaces) {
        this.spacesConfig = config;
    }

    async uploadContent(buffer: Buffer) : Promise<string> {

        const uuidv1 = require('uuid/v1');

        logger.info(`loading spaces configuration`);        

        const spacesEndpoint = new AWS.Endpoint('sfo2.digitaloceanspaces.com');

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

                logger.info(`object=${objectParams.Key} uploaded`);
                
            }).catch(() => {

                logger.error(`can't upload object=${objectParams}`);
                
                throw new Error(`can't upload object: ${objectParams}`);
            });
     
        return fileName;
    }

}