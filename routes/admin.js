const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

router.get('/admin', isAuth, adminControllers.getAdmin);

router.get('/admin/edit-user/:userId', isAuth, adminControllers.getEditUser);

router.post('/admin/edit-user', isAuth, adminControllers.postEditUser);

router.get('/admin/delete-user/:userId', isAuth, adminControllers.getDeleteUser);


module.exports = router;