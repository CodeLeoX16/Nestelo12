const express = require('express');
const router = express.Router();
const wrapAsync = require('../utility/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require('../controllers/users.js');

router.route("/signup")
    .get( userController.renderSignup)
    .post( wrapAsync(userController.signupuser));


router.route("/login")
    .get(userController.renderLogin)
    .post(
        saveRedirectUrl,
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true,
        }),
        userController.loginuser
    );


router.get('/logout', userController.logoutuser);

module.exports = router;