const express = require('express');
const { body } = require('express-validator');

const websiteControllers = require('../controllers/website');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', websiteControllers.getIndex);

router.get('/dashboard', isAuth, websiteControllers.getDashboard);

router.get('/deposit', isAuth, websiteControllers.getDeposit);

router.get('/withdraw', isAuth, websiteControllers.getWithdraw);

router.get('/verification', isAuth, websiteControllers.getVerification);

router.post('/verification', isAuth, websiteControllers.postVerification);

router.get('/deposit-proof', isAuth, websiteControllers.getDepositProof);

router.post('/deposit-proof', isAuth, websiteControllers.postDepositProof);

router.get('/transactions', isAuth, websiteControllers.getTransactions);

router.get('/trade-history', isAuth, websiteControllers.getTradeHistory);

router.get('/profile', isAuth, websiteControllers.getProfile);

router.get('/change-password', isAuth, websiteControllers.getChangePassword);

router.post(
  '/change-password', 
  isAuth, 
  [
    body('current_password', 'Invalid current password').trim().isLength({min: 6}).notEmpty(),
    body('password', 'Password must be 6 characters or more').trim().isLength({min: 6}).notEmpty(),
    body('confirm_password', 'Passwords do not match')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],
  websiteControllers.postChangePassword);

  router.get('/termsandconditions', websiteControllers.getTermsAndConditions);

module.exports = router