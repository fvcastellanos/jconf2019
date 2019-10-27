import { BaseResponse } from "./base.response";

export class ErrorResponse extends BaseResponse {

    error: string;

    constructor (requestId: string, error: string) {

        super();
        this.requestId = requestId;
        this.error = error;
    }
}