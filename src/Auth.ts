import Formidable from "formidable";
import nodemailer from "nodemailer";
import Bcrypt from "bcrypt";
import { Document, Model } from "mongoose";
import { Request, Response } from "express";

interface Auth {
  SignUp(request: Request, response: Response): Response;
  Login(request: Request, response: Response): Object;
}

class AuthController implements Auth {
  userModel: Model<Document>;
  userSession: Document;
  hashRounds: number;
  mailTransporterUser: string;
  mailTransporterPass: string;
  passwordLength: number;

  constructor(
    userModel: Model<Document>,
    userSessions: Document,
    hashRounds: number,
    mailTransporterUser: string,
    mailTransporterPass: string,
    passwordLength: number
  ) {
    this.userModel = userModel;
    this.userSession = userSessions;
    this.hashRounds = hashRounds || 15;
    this.mailTransporterUser = mailTransporterUser;
    this.mailTransporterPass = mailTransporterPass;
    this.passwordLength = passwordLength || 8;
  }

  SignUp(request: Request, response: Response) {
    const form: Formidable.IncomingForm = new Formidable.IncomingForm();

    try {
      form.parse(request, async (error, fields, files) => {
        if (error) {
          return response
            .status(500)
            .json({ msg: "Network Error: Failed to sign user up" });
        }

        const { username, email, password, verifiedPassword } = fields;

        if (!username || !email || !password || !verifiedPassword) {
          return response.status(400).json({ msg: "All fields are required" });
        }

        if (password.length < this.passwordLength) {
          return response.status(400).json({
            msg: `Password has to be at least ${this.passwordLength} characters long`,
          });
        }

        if (password !== verifiedPassword) {
          return response.status(400).json({ msg: "Password's do not match" });
        }

        const isUserAlreadyExisting = await this.userModel.findOne({
          email: email,
        });

        if (!isUserAlreadyExisting) {
          return response
            .status(400)
            .json({ msg: "Account with this email already exist" });
        }

        const salt: string = await Bcrypt.genSalt(this.hashRounds);
        const hashedPassword: string = await Bcrypt.hash(password, salt);

        const newUser = new this.userModel({
          username: username,
          email: email,
          password: hashedPassword,
        });

        const savedUser = await newUser.save();
      });
      return response.status(201).json({ msg: "Account successfully created" });
    } catch (error) {
      console.error(error);
      return response
        .status(500)
        .json({ msg: "Network Error: Failed to signup user" });
    }
  }
  Login(request: Request, response: Response) {
    const form: Formidable.IncomingForm = new Formidable.IncomingForm();

    try {
      form.parse(request, async (error, fields, files) => {
        if (error) {
          return response
            .status(500)
            .json({ msg: "Network Error: Failed to login in user" });
        }

        const { email, password } = fields;

        if (!email || !password) {
          return response.status(400).json({ msg: "All fields are required" });
        }

        const user = await this.userModel.findOne({ email: email });

        if (!user) {
          return response
            .status(404)
            .json({ msg: "Account with this email does not exist" });
        }

        const userSession: Object = {
          email: email,
          id: user._id,
        };
      });
      return response.status(200).json({ msg: "Logged in" });
    } catch (error) {
      console.error(error);
      return response
        .status(500)
        .json({ msg: "Network Error: Failed to login user" });
    }
  }
}

export default AuthController;
