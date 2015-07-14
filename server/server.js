var express        = require('express')
    , app          = express()
    , bodyParser   = require('body-parser')
    , cookieParser = require('cookie-parser')
    , session      = require('express-session')
    , http         = require('http')
    , logger       = require('morgan')
    , mongoose     = require('mongoose')
    , stringFormat = require('string-format')
    , passport     = require('passport')
    , path         = require('path')

    , server_port  = process.env.OPENSHIFT_NODEJS_PORT || 3000
    , server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
    , mongoDbConnString = getMongoDbConnString();


//order matters
var appSettings  = require('./appSettings');
appSettings.env = app.get('env');

var routes = require('./routes');
var breezeRoutes = require('./breezeRoutes');

initializeDbConnection();
initializeDefaultUsers().then(continueInit).catch(function(error){
    console.log('initializeDefaultUsers throws: ' + error);
});

function continueInit() {
    configureMiscMiddlewares(app);
    configureViewEngine(app);
    configurePassport(app);
    configureMiscMiddlewares(app);
    configureViewEngine(app);
    configurePassport(app);

    routes.init(app);
    breezeRoutes.init(app, mongoDbConnString);

    configureStaticFileServer(app);

    // create server (in case interested in socket.io)
    var server = http.createServer(app);

    // Start listening for HTTP requests
    server.listen(server_port, server_ip_address, function () {
        console.log('env = ' + appSettings.env +
        '\n__dirname = ' + __dirname +
        '\nprocess.cwd = ' + process.cwd());
        console.log('Listening on ' + server_ip_address + ':' + server_port);
        console.log('MongoDb: ' + mongoDbConnString);
    });
}

function initializeDbConnection() {
    //initialize repository and register model to mongoose
    require('./services/repository');
    mongoose.connect(mongoDbConnString);
}

function getMongoDbConnString() {
    var mongoDbName   = process.env.OPENSHIFT_MONGODB_DB_URL ? process.env.OPENSHIFT_APP_NAME : 'siqcloset';

    //if running on OpenShift, use its env variable
    //else, we're in localhost mode
    return process.env.OPENSHIFT_MONGODB_DB_URL ?
        stringFormat('{0}{1}', process.env.OPENSHIFT_MONGODB_DB_URL, mongoDbName)
        : stringFormat('mongodb://{0}:{1}/{2}', 'localhost', 27017, mongoDbName);
}

function initializeDefaultUsers() {
    var Promise = require('bluebird');
    var promises = [];
    if(appSettings.env === 'development') {
        promises.push(initializeDefaultDemoUser());
    }
    promises.push(initializeDefaultAdmin());

    return Promise.all(promises);
}

function initializeDefaultAdmin() {
    var repository = require('./services/repository');
    return repository.createDefaultAdmin();
}

function initializeDefaultDemoUser() {
    var repository = require('./services/repository');
    return repository.createDefaultDemoUser();
}

function configureMiscMiddlewares(app) {
    app.use(logger('dev'));
    app.use(bodyParser()); // both json & urlencoded
    app.use(cookieParser());
    app.use(session({
        secret: 'some secret',
        resave: false,
        saveUninitialized: false
    }));
}

function configureViewEngine(app){
    app.engine('html', require('swig').renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/../client');
}

function configurePassport(app) {
    var url = process.env.OPENSHIFT_APP_DNS ? stringFormat('https://{0}', process.env.OPENSHIFT_APP_DNS) : stringFormat('http://{0}:{1}', 'localhost', server_port);
    var callbackURL = url + '/auth/google/callback';

    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    var settings = {
        clientID: '66013822741-rrb71q7dcp2t8o8td2uncobjd41dpfc3.apps.googleusercontent.com',
        clientSecret: 'iM3YrFkNgMOyL_eaFF1qwSQj',
        callbackURL: callbackURL
    };
    passport.use(new GoogleStrategy(
        settings,
        function(accessToken, refreshToken, profile, done){
            var user = { 'email': profile.emails[0].value, 'displayName': profile.displayName };
            var repository = require('./services/repository');
            repository.findUser(user.email).then(function(foundUser){
                done(null, foundUser);
            });
        }
    ));

    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(function(username, password, done){
        var repository = require('./services/repository');
        repository.findUser(null, username, password).then(function(foundUser){
            if(foundUser){
                foundUser.password = null;  //never send password to client
                done(null, foundUser);
            } else {
                done(null, false, {message: 'incorrect username/password'});
            }
        });
    }));

    passport.serializeUser(function(user, done){
        done(null, JSON.stringify(user));
    });

    passport.deserializeUser(function(json, done){
        var user = JSON.parse(json);
        if (user){
            done(null, user);
        } else {
            done(new Error('Bad JSON string in session'), null);
        }
    });

    app.use(passport.initialize());
    app.use(passport.session());
}

function configureStaticFileServer(app){
    // Support static file content
    // Consider 'st' module for caching: https://github.com/isaacs/st
    //app.use( fileServer( __dirname+'/../client' ));
    app.use(express.static(path.join(__dirname, '/../client')));
}