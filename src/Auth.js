import nodemailer from "nodemailer";
import Formidable from "formidable";
import Bcrypt from "bcrypt";

class ExpressSessionAuth {
  constructor(
    userModel,
    userSessions,
    mailTransporterUser,
    mailTransporterPass,
    passwordLength,
    hashRounds
  ) {
    this.userModel = userModel;
    this.userSessions = userSessions;
    this.mailTransporterUser = mailTransporterUser;
    this.mailTransporterPass = mailTransporterPass;
    this.passwordLength = passwordLength || 8;
    this.hashRounds = hashRounds || 15;
  }

  SignUp(request, response) {
    const form = new Formidable.IncomingForm();

    try {
      form.parse(request, async (error, fields, files) => {
        if (error) {
          return response.status(500).json({
            msg: "Network Error (Formidable Error): Failed to signup user",
            error: error,
          });
        }

        const { username, email, password, verifiedPassword } = fields;

        if (!username || !email || !password || !verifiedPassword) {
          return response.status(500).json({ msg: "All fields are required" });
        }

        if (password.trim().length < this.passwordLength) {
          return response
            .status(400)
            .json({ msg: "Password has to be at least 8 characters" });
        }

        if (password.trim() !== verifiedPassword.trim()) {
          return response.status(400).json({ msg: "Password's do not match" });
        }

        const isUserAlreadyExising = await this.userModel.findOne({
          email: email,
        });

        if (isUserAlreadyExising) {
          return response
            .status(400)
            .json({ msg: "Account with this email already exist" });
        }

        const salt = await Bcrypt.genSalt(this.hashRounds);
        const hashedPassword = await Bcrypt.hash(password, salt);
        const newUser = new this.userModel({
          email: email,
          username: username,
          password: hashedPassword,
        });

        const savedUser = await newUser.save();

        const transporter = nodemailer.createTransport({
          service: "SendinBlue",
          auth: {
            user: this.mailTransporterUser,
            pass: this.mailTransporterPass,
          },
        });

        const mailOptions = {
          from: this.mailTransporterUser,
          to: email,
          subject: "Account Created",
          html: `

                <h1>Account Creation Successfull</h1>

            
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return response.status(500).json({
              msg: `Network Error: Failed to send confirmation email. ${
                savedUser._id.length > 0
                  ? "But Account was successfully created"
                  : "Failed to create account"
              }`,
            });
          }
          return response
            .status(200)
            .json({ msg: "Account Successfully created" });
        });
      });
    } catch (error) {
      return response.status(500).json({
        msg: "Network Error (Server Error): Failed to signup user",
        error: error,
      });
    }
  }

  Login(request, response) {
    const form = new Formidable.IncomingForm();

    try {
      form.parse(request, async (error, fields, files) => {
        if (error) {
          return response
            .status(500)
            .json({ msg: "Network Error: Failed to signin user" });
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

        const hashedPassword = user.password;
        const isPasswordValid = await Bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
          return response.status(400).json({ msg: "Invalid Credentials" });
        }

        const isUserSessionExisting = await this.userSessions.findOne({
          "session.user.id": user._id,
        });
        if (isUserSessionExisting) {
          return response
            .status(200)
            .json({ msg: "Account already logged in" });
        }

        const userSessionObj = {
          id: user._id,
          email: user.email,
        };

        request.session.user = userSessionObj;

        return response.status(200).send(request.sessionID);
      });
    } catch (error) {
      return response
        .status(500)
        .json({ msg: "Network ErrorL Failed to sigin user" });
    }
  }
}

export default ExpressSessionAuth;
