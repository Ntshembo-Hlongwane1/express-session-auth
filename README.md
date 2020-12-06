# express-session-auth

### Installation
```
$ npm install express-session-auth
```

## API

```js
const expressSessionAuth = require('express-session-auth');
const auth = new expressSessionAuth(options)
```
#### or 
```js
import expressSessionAuth from 'express-session-auth'
const auth = new expressSessionAuth(options)
```

## Requirements

- [express-session middleware](https://www.npmjs.com/package/express-session)
- [nodemailer](https://www.npmjs.com/package/nodemailer)
- [SendinBlue](https://www.sendinblue.com/)


## Options
```express-session-auth``` accepts the following parameters when a new instance object is made

##### userModel
userModel is to imported from your models that you have set out the current accepted model schema is this below
```js
const userSchema = mongoose.Schema({
  username:{type:String, required:true},
  email:{type:String, required:true},
  password:{type:String, required:true}
})
```

##### userSessions
userSessions is model used to structure the usersessions according to how express-session makes their object, the accepted model schema
```js
const userSessionSchema = mongoose.Schema({
  expires:{type:Date, required:true},
  session:{type:Object, required:true}
})
```

##### mailTransporterUser
mailTransporterUser is the user/email given in by mail transporter *the current supported mail transporter is sendinBlue*

##### mailTransporterPass
mailTransporterUser is the password given in by mail transporter *the current supported mail transporter is sendinBlue*

##### passwordLength (Optional)
This is for setting the password length that you want for you authentication system. *Default length is 8*

##### hashRounds
This are the number of rounds you want Bcrypt to use to create salt for hashing user's password. *Default round 15*


### Contribution
Fork the repository make your changes, send me a pull request and I will review the sourcecode


### LET'S BUILD STRONGEST AUTH SYSTEM 🔥 🔐
                                                      
