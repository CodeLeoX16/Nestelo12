const User = require('../models/user.js');

module.exports.renderSignup = (req, res) => {
    res.render('users/signup.ejs');
};

module.exports.signupuser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Account already exists.');
            return res.redirect('/signup');
        }
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                req.flash('error', 'Login failed after registration.');
                return res.redirect('/signup');
            }
            req.flash('success', 'Welcome to Nestelo!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs');
};

module.exports.loginuser = (req, res) => {
    req.flash('success', 'Welcome back!');
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
};

module.exports.logoutuser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out successfully!');
        res.redirect('/listings');
    });
};