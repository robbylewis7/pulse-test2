'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const cors = require('cors');
const {PORT, DATABASE_URL} = require('./config');
const {Teams} = require('./models');
const passport = require('passport');
const favicon = require('express-favicon');
const path = require('path');


app.use(express.static('public'));

app.use(express.json());

app.use(cors({
    origin: 'https://aqueous-cliffs-74103.herokuapp.com'
}));


const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');


app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
//
const jwtAuth = passport.authenticate('jwt', { session: false });


//////////////////
//End-Points
//////////////////

app.use(express.static(path.join(__dirname, 'Client/build')));

app.get('/', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});



app.get('/teams', (req, res) => {
      Teams.find()
        .then(teams => {
            res.status(200).json({
            teams: teams.map(team => team.serialize())
      })
      let teamsForNews = teams[0].team.toString();
      let teamsForNewsString = teamsForNews.replace(/,/g, ' OR ');
      console.log(teamsForNewsString);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});



app.get('/teams/:user', (req, res) => { 
  Teams.find({user: req.params.user})
      .then(teams => {
            res.status(200).json({
            teams: teams.map(team => team.serialize())

      });

    })
      .catch(err => { 
      console.error(err); res.status(500).json({ message: 'Internal server error' }); }); });




app.post('/teams', (req, res) => {

  const requiredFields = ['team', 'user'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

Teams.find().then(team => {
  //  if (user.length !== 0) {
  //    return res.status(400).send('This team already exists');
  //  } else {
      Teams
        .create({
            team: req.body.team,
            user: req.body.user
      })
        .then(team => res.status(201).json(team.serialize()))
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Internal server error' });
       });
    });
});
    
    
    
    
    
    
app.put('/teams/:user', (req, res) => {
  if (!(req.params.user && req.body.user && req.params.user === req.body.user)) {
    const message =
      `Request path user (${req.params.user}) and request body user ` +
      `(${req.body.user}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }
     const requiredFields = ['team'];
        let message;
        let missingError = false;

  requiredFields.forEach(field => {
    if (!(req.body[field])) {
      message = `Missing \`${field}\` value in request body`;
      console.error(message);
      missingError = true;
      return;
    }
  });

  if (missingError) {
    return res.status(400).send(message);
  }

  const toUpdate = {};
  const updateableFields = [
    'team'
  ];
      
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
      Teams.update({user: req.params.user}, {$set: toUpdate})
    .then(log => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});
    
    
    
    
app.delete('/teams/:id', (req, res) => {
  Teams.findByIdAndRemove(req.params.id)
    .then(log => res.status(204).end())
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.use('*', function(req, res) {
  res.status(404).json({ message: 'Not Found' });
});

//News API



    
    
    
    
//////////////////
//Server
//////////////////
    
    
    

    
let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.set('useCreateIndex', true);
    mongoose.connect(
      databaseUrl,
    { useNewUrlParser: true },
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}



if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, server, runServer, closeServer };
