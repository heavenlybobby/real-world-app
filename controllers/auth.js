const User = require("../models/user");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "therealworld1985@gmail.com",
    pass: "fwdu bgmi vgsq dbtu",
  },
});

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Online Forex ECN/STP Broker With 24/7 Support | Therealworld",
    errorMessage: message,
    oldInput: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Online Forex ECN/STP Broker With 24/7 Support | Therealworld",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { fullname, username, email, password, confirmPassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Online Forex ECN/STP Broker With 24/7 Support | Therealworld",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        fullname: fullname,
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        fullname: fullname,
        username: username,
        email: email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      transporter.sendMail({
        to: email,
        from: {
          name: "Therealworld",
          address: "support@therealworld.com",
        },
        subject: "Signup succeeded!",
        html: `
        <center>
          <div  style="background-color: #e2e1e1; padding: 10px;" width="230px">
            <div>
              <img src="https://app.therealworld.expert/public/images/fps_logo1.png" alt="logo" width="230px">
            </div>
            <div>
              <h3>HI, ${username}</h3>
              <p>Thank you for choosing Therealworld as your preferred trading platform.</p>
              <P>
                Your trading account has been successfully created. Make sure to keep your
                login details safe for future references. For safety and security, never share
                your login details or password with anyone.
              </P>
            </div> 
          </div>
        </center>  
        `,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Online Forex ECN/STP Broker With 24/7 Support | Therealworld",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log(errors.array());
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle:
            "Online Forex ECN/STP Broker With 24/7 Support | Therealworld",
          errorMessage: "Incorrect email or password",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [{ path: "email", path: "password" }],
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/dashboard");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle:
              "Online Forex ECN/STP Broker With 24/7 Support | Therealworld",
            errorMessage: "Incorrect email or password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [{ path: "email", path: "password" }],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getForgottenPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset password",
    errorMessage: message,
  });
};

exports.postForgottenPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/reset-password");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset-password");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save().then((result) => {
          res.redirect("/");
          transporter.sendMail({
            to: req.body.email,
            from: {
              name: "The Realworld",
              address: "no-reply@therealworld.com",
            },
            subject: "Password reset",
            html: `
              <p>You requested a password reset</p>
              <p>Click this <a href="https://www.realworldapp.xyz/reset-password/${token}">link</a> to set a new password</p>
            `,
          });
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
