//Set up dependencies
const express = require('express');
app = express();
const bodyParser = require('body-parser');  
const morgan = require('morgan');  
const passport = require('passport');  
const jwt = require('jsonwebtoken');  

//Set up database connections
const config = require('./config/config.js');
const mongoose = require('mongoose');
const user = require('./models/user.js');


//Get POST requests for API
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Log requests to console
app.use(morgan('dev'));

//Initialize passport
app.use(passport.initialize());

//Connect to database
mongoose.connect(config.database,  {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database!");    
}).catch(err => {
    console.log('Error connecting to database!', err);
    process.exit();
});

//Import passport
require('./config/passport.js')(passport);

//Create API routes
const apiRoutes = express.Router();

//Register new users
apiRoutes.post('/register', (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.json({success: false, message: 'Please type email and password.'});
    }
    else {
        const newUser = new user({
            email: req.body.email,
            password: req.body.password
        });

        //Check if user already exists
        newUser.save((err) => {
            if (err) {
                return res.json({success: false, message: 'Email already in use.'});
            }
            res.json({success: true, message: 'User created successfully.'});
        });
    }
});

//Authenticate user and assign JSON web token
apiRoutes.post('/authenticate', (req, res) => {
    user.findOne({
        email: req.body.email
    }, (err, user) => {
        if (err) throw err;

        if (!user) res.send({success: false, message: 'User not found.' });
        else {
            //Validate password
            user.validatePassword(req.body.password, (err, isMatch) => {
                if (isMatch && !err) {
                    //Create token
                    const token = jwt.sign(user, config.secret, {
                        expiresIn: 10000
                    });
                    res.json({success: true, token: 'JWT ' + token});
                }
                else res.send({success: false, message: 'Incorrect password.'});
            });
        }
    });
});

//Protect dashboard route
apiRoutes.get('/dashboard', passport.authenticate('jwt', {session: false}), (req, res) => {  
    res.send('User ID: ' + req.user._id + '.');
});

// Set url for API group routes
app.use('/api', apiRoutes);  

//Homepage route
app.get('/', (req, res) => {
    res.send('Welcome to the eLibrary!');
});

//Server listening on port 3000
app.listen(config.serverport, () => {
    console.log('Server listening on port 3000.');
});
