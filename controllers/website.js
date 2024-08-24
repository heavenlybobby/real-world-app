const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "therealworld1985@gmail.com",
    pass: "fwdu bgmi vgsq dbtu",
  },
})

exports.getIndex = (req, res, next) => {
  res.render('index');
}

exports.getDashboard = (req, res, next) => {
  res.render('dashboard', {
    user: req.user,
    path: '/dashboard'
  });
}

exports.getDeposit = (req, res, next) => {
  res.render('deposit', {
    user: req.user,
    path: '/deposit'
  })
}

exports.getWithdraw = (req, res, next) => {
  res.render('withdraw', {
    user: req.user,
    path: '/withdraw'
  })
}

exports.getVerification = (req, res, next) => {
  User.findOne({email: req.user.email})
    .then(user => {
      return res.render('verification', {
        user: req.user,
        path: '/verification',
        verified: user.verified
      })
    })  
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.postVerification = (req, res, next) => {
  User.findOne({email: req.user.email})
    .then(user => {
      if (!user) {
        throw new Error('User not found!')
      }
      user.verified = true;
      return user.save();
    })
    .then(result => {
      res.redirect('/verification');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getDepositProof = (req, res, next) => {
  res.render('deposit-proof', {
    user: req.user,
    path: '/deposit-proof'
  })
}

exports.postDepositProof = (req, res, next) => {
  // upload image
  const image = req.body.verification;
  const user = req.user.email;
  res.redirect('/deposit-proof');
  transporter.sendMail({
    to: 'heavenlybobby518@gmail.com',
      from: "therealworld1985@gmail.com",
      subject: "Payment verification",
      html: `<h1>A client just sent a payment verification</h1> <p>${user}</p>`,
      attachments: [{
        filename: image.originalname,
        path: image.path
      }]
  })
};

exports.getTransactions = (req, res, next) => {
  res.render('transactions', {
    user: req.user,
    path: '/transactions'
  })
}

exports.getTradeHistory = (req, res, next) => {
  res.render('trade-history', {
    user: req.user,
    path: '/trade-history'
  })
}

exports.getProfile = (req, res, next) => {
  res.render('profile', {
    user: req.user,
    path: '/profile'
  })
}

exports.getChangePassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null
  }
  res.render('change-password', {
    user: req.user,
    path: '/change-password',
    errorMessage: message,
    oldInput: {
      current_password: "",
      password: "",
      confirm_password: ""
    },
    validationErrors: [],
  });
}

exports.postChangePassword = (req, res, next) => {
  const current_password = req.body.current_password;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('change-password', {
      user: req.user,
      path: '/change-password',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        current_password: current_password,
        password: password,
        confirm_password: confirm_password
      },
      validationErrors: errors.array(),
    })
  }

  User.findOne({email: req.user.email})
    .then(user => {
      if (!user) {
        throw new Error('No user found');
      }
      bcrypt
        .compare(current_password, user.password)
        .then(doMatch => {
          if (!doMatch) {
            return res.status(422).render('change-password', {
              user: req.user,
              path: '/change-password',
              errorMessage: 'Invalid current password',
              oldInput: {
                current_password: current_password,
                password: password,
                confirm_password: confirm_password
              },
              validationErrors: [{path: 'current_password'}],
            })
          }

          return bcrypt.hash(password, 12)
            .then(hashedPassword => {
              user.password = hashedPassword;
              return user.save();
            })
            .then(result => {
              res.redirect('/dashboard');
              transporter.sendMail({
                to: email,
                from: "shop@node-complete.com",
                subject: "Password Changed",
                html: "<h1>You successfully Changed your password!</h1>",
              });
            })
            .catch(err => {
              console.log(err);
              res.status(500).render('change-password', {
                user: req.user,
                path: '/change-password',
                errorMessage: 'An error occurred. Please try again later.',
                oldInput: {
                  current_password: current_password,
                  password: password,
                  confirm_password: confirm_password
                },
                validationErrors: [],
              });
            })
        })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getTermsAndConditions = (req, res, next) => {
  res.render('terms-and-conditions');
}