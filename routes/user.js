const express=require('express');
const router=express.Router();
const passport = require('passport');
const catchAsync = require('../utils/Asyncerror');


const users = require('../controllers/user');


//registering 
router.route('/register')
    .get(users.renderRegister )
    .post(catchAsync(users.register))



//loging in


router.route('/login')
    .get(users.renderLogin)
    .post( passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)



router.get('/logout',users.logout)


module.exports = router;
