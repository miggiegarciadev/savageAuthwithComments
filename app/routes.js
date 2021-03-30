/// all actions that happen on the webpage are handled here (server.js allows this)


//instructions that tell node.js which bits of code to export from a given file so that other files can have access
module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
  //Remember / means 'root' and usually renders index.html
    app.get('/', function(req, res) {
      // .render method loads the page between ()
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
  // isLoggedIn is a form of middleware 
    app.get('/profile', isLoggedIn, function(req, res) {
      //finds and returns all the info from the database and toarray turns it into an arrary
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      // the names here need to match the name="" in profile.ejs forms
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })
  
  //{<propertyName1> : <value1>, <propertyName2> : <value2>}
  //{"Chance The Rapper": {realName: "Chancelor", birthday:"something"}, "Biggie":"..."
  
// .put is the method type, /message = name of fetch, (req, res) is the callback functions
    app.put('/messages', (req, res) => {
//       'messages' name of collection
      
      db.collection('messages')
      // everything between the first srt of {} is a filter - if there's no filter, the method will find first object
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        // this is not a filter. $set is a database method giving one instruction for 
        $set: {thumbUp:req.body.thumbUp + 1}
        
        // this causes duplicates if object not found (check your filter)
        // upsert is a property name, sort a property name that is part of an object
        // sort is not an object
      }, {sort: {_id: -1} ,upsert: true}, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })
// delete is a methos type, /messages is neame of the fetch
    app.delete('/messages', (req, res) => {
      // 'messages' is the name of the mongo db collection, everything between firt set of {} is a filter, (err, result) is a callback function
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        // error 500 is an internal server error
        // like error 404 is a not found error
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
      //'/login' corresponds to line 18 on index.ejs
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
