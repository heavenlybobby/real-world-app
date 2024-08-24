const express = require('express');
const { body } = require('express-validator');


const authControllers = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/signup', authControllers.getSignup);

router.get('/login', authControllers.getLogin)

router.post(
  '/signup',
  [
    body('email', "enter a valid email address!")
      .isEmail()
      .normalizeEmail()
      .notEmpty()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({email: value})
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject(
                'Email address already exists!'
              );
            }
          })
      }),
    body('password', 'Password must be 6 characters or more')
      .isLength({min: 6})
      .isString()
      .notEmpty()
      .trim(),
    body('username', 'Username must be 5 characters or more')
      .isLength({min: 5})
      .isString()
      .notEmpty()
      .trim()
      .custom((value, { req }) => {
        return User.findOne({username: value})
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject(
                'Username already exists!'
              )
            }
          })
      }),
    body('fullname', 'Full name must be only letters and 3 characters or more')
      .isLength({min: 3})
      .trim()
      .notEmpty()
      .isString(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],
  authControllers.postSignup
);

router.post(
  '/login',
  [
    body('email', 'Enter a valid email address!')
      .isEmail()
      .normalizeEmail()
      .trim()
      .notEmpty(),
    body('password', 'Incorrect email or Password!')
      .trim()
  ], 
  authControllers.postLogin
);

router.post('/logout', authControllers.postLogout);

router.get('/reset-password', authControllers.getForgottenPassword);

router.post('/reset-password', authControllers.postForgottenPassword);

router.get('/reset-password/:token', authControllers.getNewPassword);

router.post('/new-password', authControllers.postNewPassword);

module.exports = router;