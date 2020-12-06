import nodemailer from "nodemailer";
import Formidable from "formidable";
import Bcrypt from "bcrypt";

// userModel,
// userSessions,
// mailTransporterUser,
// mailTransporterPass,
// passwordLength,
// hashRounds

const Auth = {
  passwordLength: 8,
  userModel: null,
  userSessions: null,
  mailTransporterUser: null,
  mailTransporterPass: null,
  hashRounds: 15,
};

Auth.SignUp = (request, response) => {
  const form = new Formidable.IncomingForm();

  try {
    form.parse(request, async (error, fields, files) => {
      if (error) {
        return response
          .status(500)
          .json({ msg: "Network Error: Failed to signup user" });
      }

      const { username, email, password, verifiedPassword } = fields;

      if (!username || !email || !password || !verifiedPassword) {
        return response.status(500).json({ msg: "All fields are required" });
      }

      if (password.trim().length < Auth.passwordLength) {
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

      const salt = await Bcrypt.genSalt(Auth.hashRounds);
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
          user: Auth.mailTransporterUser,
          pass: Auth.mailTransporterPass,
        },
      });

      const mailOptions = {
        from: Auth.mailTransporterUser,
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
    return response
      .status(500)
      .json({ msg: "Network Error: Failed to signup user" });
  }
};

Auth.Login = (request, response) => {
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

      const user = await Auth.userModel.findOne({ email: email });

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

      const isUserSessionExisting = await Auth.userSessions.findOne({
        "session.user.id": user._id,
      });
      if (isUserSessionExisting) {
        return response.status(200).json({ msg: "Account already logged in" });
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
};

export default Auth;
