import { CustomError } from "./custom-error";

export class BadRequestError  extends CustomError{
    statusCode= 400;

    constructor(public message: string){
        super(message);

        Object.setPrototypeOf(this,BadRequestError.prototype);
    }

    serializeErrors(){
        return [{ message: this.message}]
    }
}
//I just wanted to keep up on the streak