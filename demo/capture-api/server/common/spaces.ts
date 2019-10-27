
export class Spaces {

    readonly clientId: string;
    readonly secret: string;
    readonly baseDirectory: string;
    readonly bucket: string;

    constructor() {

        this.clientId = process.env.AWS_ACCESS_KEY_ID;
        this.secret = process.env.AWS_SECRET_ACCESS_KEY;
        this.bucket = process.env.SPACES_BUCKET;
        this.baseDirectory = process.env.SPACES_BASE_PATH;
    }    
}

export default new Spaces();