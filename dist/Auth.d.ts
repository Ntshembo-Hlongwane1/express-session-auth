import { Document, Model } from "mongoose";
import { Request, Response } from "express";
interface Auth {
    SignUp(request: Request, response: Response): Response;
    Login(request: Request, response: Response): Object;
    userModel: Model<Document>;
    userSession: Model<Document>;
    hashRounds: number;
    mailTransporterUser: string;
    mailTransporterPass: string;
    passwordLength: number;
}
declare class AuthController implements Auth {
    userModel: Model<Document>;
    userSession: Model<Document>;
    hashRounds: number;
    mailTransporterUser: string;
    mailTransporterPass: string;
    passwordLength: number;
    constructor(userModel: Model<Document>, userSessions: Model<Document>, hashRounds: number, mailTransporterUser: string, mailTransporterPass: string, passwordLength: number);
    SignUp(request: Request, response: Response): Response<any>;
    Login(request: Request, response: Response): {};
}
export default AuthController;
//# sourceMappingURL=Auth.d.ts.map