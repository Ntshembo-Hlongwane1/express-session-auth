"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _formidable = _interopRequireDefault(require("formidable"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExpressSessionAuth = /*#__PURE__*/function () {
  function ExpressSessionAuth(userModel, userSessions, mailTransporterUser, mailTransporterPass, passwordLength, hashRounds) {
    _classCallCheck(this, ExpressSessionAuth);

    this.userModel = userModel;
    this.mailTransporterUser = mailTransporterUser;
    this.mailTransporterPass = mailTransporterPass;
    this.passwordLength = passwordLength || 8;
    this.hashRounds = hashRounds || 15;
    this.userSessions = userSessions;
  }

  _createClass(ExpressSessionAuth, [{
    key: "SignUp",
    value: function SignUp(request, response) {
      var _this = this;

      var form = new _formidable["default"].IncomingForm();

      try {
        form.parse(request, /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(error, fields, files) {
            var username, email, password, verifiedPassword, isUserAlreadyExising, salt, hashedPassword, newUser, savedUser, transporter, mailOptions;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!error) {
                      _context.next = 2;
                      break;
                    }

                    return _context.abrupt("return", response.status(500).json({
                      msg: "Network Error: Failed to signup user"
                    }));

                  case 2:
                    username = fields.username, email = fields.email, password = fields.password, verifiedPassword = fields.verifiedPassword;

                    if (!(!username || !email || !password || !verifiedPassword)) {
                      _context.next = 5;
                      break;
                    }

                    return _context.abrupt("return", response.status(500).json({
                      msg: "All fields are required"
                    }));

                  case 5:
                    if (!(password.trim().length < _this.passwordLength)) {
                      _context.next = 7;
                      break;
                    }

                    return _context.abrupt("return", response.status(400).json({
                      msg: "Password has to be at least 8 characters"
                    }));

                  case 7:
                    if (!(password.trim() !== verifiedPassword.trim())) {
                      _context.next = 9;
                      break;
                    }

                    return _context.abrupt("return", response.status(400).json({
                      msg: "Password's do not match"
                    }));

                  case 9:
                    _context.next = 11;
                    return _this.userModel.findOne({
                      email: email
                    });

                  case 11:
                    isUserAlreadyExising = _context.sent;

                    if (!isUserAlreadyExising) {
                      _context.next = 14;
                      break;
                    }

                    return _context.abrupt("return", response.status(400).json({
                      msg: "Account with this email already exist"
                    }));

                  case 14:
                    _context.next = 16;
                    return _bcrypt["default"].genSalt(_this.hashRounds);

                  case 16:
                    salt = _context.sent;
                    _context.next = 19;
                    return _bcrypt["default"].hash(password, salt);

                  case 19:
                    hashedPassword = _context.sent;
                    newUser = new _this.userModel({
                      email: email,
                      username: username,
                      password: hashedPassword
                    });
                    _context.next = 23;
                    return newUser.save();

                  case 23:
                    savedUser = _context.sent;
                    transporter = _nodemailer["default"].createTransport({
                      service: "SendinBlue",
                      auth: {
                        user: _this.mailTransporterUser,
                        pass: _this.mailTransporterPass
                      }
                    });
                    mailOptions = {
                      from: _this.mailTransporterUser,
                      to: email,
                      subject: "Account Created",
                      html: "\n\n                <h1>Account Creation Successfull</h1>\n\n            \n            "
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        return response.status(500).json({
                          msg: "Network Error: Failed to send confirmation email. ".concat(savedUser._id.length > 0 ? "But Account was successfully created" : "Failed to create account")
                        });
                      }

                      return response.status(200).json({
                        msg: "Account Successfully created"
                      });
                    });

                  case 27:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          return function (_x, _x2, _x3) {
            return _ref.apply(this, arguments);
          };
        }());
      } catch (error) {
        return response.status(500).json({
          msg: "Network Error: Failed to signup user"
        });
      }
    }
  }, {
    key: "Login",
    value: function Login(request, response) {
      var _this2 = this;

      var form = new _formidable["default"].IncomingForm();

      try {
        form.parse(request, /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(error, fields, files) {
            var email, password, user, hashedPassword, isPasswordValid, isUserSessionExisting, userSessionObj;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!error) {
                      _context2.next = 2;
                      break;
                    }

                    return _context2.abrupt("return", response.status(500).json({
                      msg: "Network Error: Failed to signin user"
                    }));

                  case 2:
                    email = fields.email, password = fields.password;

                    if (!(!email || !password)) {
                      _context2.next = 5;
                      break;
                    }

                    return _context2.abrupt("return", response.status(400).json({
                      msg: "All fields are required"
                    }));

                  case 5:
                    _context2.next = 7;
                    return _this2.userModel.findOne({
                      email: email
                    });

                  case 7:
                    user = _context2.sent;

                    if (user) {
                      _context2.next = 10;
                      break;
                    }

                    return _context2.abrupt("return", response.status(404).json({
                      msg: "Account with this email does not exist"
                    }));

                  case 10:
                    hashedPassword = user.password;
                    _context2.next = 13;
                    return _bcrypt["default"].compare(password, hashedPassword);

                  case 13:
                    isPasswordValid = _context2.sent;

                    if (isPasswordValid) {
                      _context2.next = 16;
                      break;
                    }

                    return _context2.abrupt("return", response.status(400).json({
                      msg: "Invalid Credentials"
                    }));

                  case 16:
                    _context2.next = 18;
                    return _this2.userSessions.findOne({
                      "session.user.id": user._id
                    });

                  case 18:
                    isUserSessionExisting = _context2.sent;

                    if (!isUserSessionExisting) {
                      _context2.next = 21;
                      break;
                    }

                    return _context2.abrupt("return", response.status(200).json({
                      msg: "Account already logged in"
                    }));

                  case 21:
                    userSessionObj = {
                      id: user._id,
                      email: user.email
                    };
                    request.session.user = userSessionObj;
                    return _context2.abrupt("return", response.status(200).send(request.sessionID));

                  case 24:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          return function (_x4, _x5, _x6) {
            return _ref2.apply(this, arguments);
          };
        }());
      } catch (error) {
        return response.status(500).json({
          msg: "Network ErrorL Failed to sigin user"
        });
      }
    }
  }]);

  return ExpressSessionAuth;
}();

var _default = ExpressSessionAuth;
exports["default"] = _default;
//# sourceMappingURL=Auth.js.map