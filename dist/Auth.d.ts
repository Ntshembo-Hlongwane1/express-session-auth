import { Document, Model } from "mongoose";
import { Request, Response } from "express";
interface Auth {
    SignUp(request: Request, response: Response): Response;
    Login(request: Request, response: Response): Object;
}
declare class AuthController implements Auth {
    userModel: Model<Document>;
    userSession: Document;
    hashRounds: number;
    mailTransporterUser: string;
    mailTransporterPass: string;
    passwordLength: number;
    constructor(userModel: Model<Document>, userSessions: Document, hashRounds: number, mailTransporterUser: string, mailTransporterPass: string, passwordLength: number);
    SignUp(request: Request, response: Response): Response<any>;
    Login(request: Request, response: Response): Response<any>;
}
export default AuthController;
//# sourceMappingURL=Auth.d.ts.map