var express = require('express');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var morgan = require('morgan');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');

var User = require('./app/models/user');
var Poem = require('./app/models/poem');

var configDB = require('./config/database');

var app = express();
var port = process.env.PORT || 8080;

// sessions
app.use(session({
	secret: 'sljdfhalsdkfj',
	saveUninitialized: true,
	resave: true
}));

// app config
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(flash());

// connect to db
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url);

// passport config baby!!
require('./config/passport')(passport);

// load those routes baby
require('./app/routes.js')(app, passport);

app.listen(port, function() {
	console.log('watching port', port);
});