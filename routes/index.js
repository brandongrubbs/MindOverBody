var express = require('express');
var router = express.Router();
const expressValidator = require('express-validator');
var passport = require('passport');

var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';

/* GET home page. */
router.get('/', function(req, res) {
  //console.log(req.user);
  //console.log(req.isAuthenticated());
  res.render('home', { title: 'Home' });
});

router.get('/profile', authenticationMiddleware(), function(req, res) {
  res.render('profile', { title: 'Profile' });
});

router.get('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});

router.get('/logout', (req, res, next) => {
  req.logout()
  req.session.destroy(() => {
      res.clearCookie('connect.sid')
      res.redirect('/')
  })
});

router.get('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registration' });
});
router.post('/register', function(req, res, next) {
  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
  req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
  req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
  

  const errors = req.validationErrors();

  if (errors) {
    console.log('errors: $(JSON.stringify(errors)}');
    res.render('register', {
      title: 'Registration Error',
      errors: errors
    });
  } else {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const bootcamp = req.body.bootcamp;
  
  
    const db = require('../db.js');

    bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
      // Store hash in your password DB.
    
      db.query('INSERT INTO users (username, email, password, bootcamp) VALUES (?, ?, ?, ?)', [username, email, hash, bootcamp], function(error, results, fields){
        if (error) throw error;

        db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
          if(error) throw error;

          const user_id = results[0];

          console.log(results[0]);
          req.logIn(user_id, function (err) {
            res.redirect('/');
          });
        });  
      })  
    });
  }
});
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});
 
passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});


function authenticationMiddleware() {
  return (req, res, next) => {
    console.log('req.session.passport.user: ${JSON.stringify(req.session.passport)}');
  
    return next(); // remove this line when authentication works
    // if (req.isAuthenticated()) return next();
    // res.redirect('/login')
  }
}

module.exports = router;
