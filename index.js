const cron = require("node-cron");
const express = require("express");
const fs = require("fs");
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const multer = require('multer');
var app = express();

app.set('port', (process.env.PORT || 5000))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const csv = require('fast-csv');
// const csv=require("csvtojson");


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/csv')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })

passport.use(new Strategy(
  function(username, password, cb) {
    // db.users.findByUsername(username, function(err, user) {
    //   if (err) { return cb(err); }
    //   if (!user) { return cb(null, false); }
    //   if (user.password != password) { return cb(null, false); }
    //   return cb(null, user);
    // });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
}); 

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

var date = new Date();

let lastDay =  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
///////////////////////////////////Task 1 //////////////////////////////////////////
cron.schedule(`* * ${lastDay} * *`, function() {
  lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  console.log('get message every month');
});



/////////////////////////////////////Task 2 ////////////////////////////////////////

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


/////////////////////////////////////Task 3 /////////////////////////////////////////
  
app.get('/', function(req, res){
    res.render('csvhtml',{csv : null});
  });
 
    
  
app.post('/', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  fs.createReadStream(file.path)
  .pipe(csv.parse({ headers: true }))
  .on('data', row => res.render('csvhtml',{csv : JSON.stringify(row)}))
  
 
})
  



app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
