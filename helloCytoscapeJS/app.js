// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');

//http://js.cytoscape.org/#getting-started
var cytoscape = require('cytoscape');

//https://github.com/xpepermint/socket.io-express-session/blob/master/example/index.js#L4
var Session = require('express-session');
var SessionStore = require('session-file-store')(Session);
var session = Session({store: new SessionStore({path: __dirname+'/tmp/sessions'}), secret: 'pass', resave: true, saveUninitialized: true});

//layout defaults to main, located in the views layout folder
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

//http://stackoverflow.com/questions/10615828/how-to-use-timezone-offset-in-nodejs
//https://www.npmjs.com/package/time
var time = require('time');

app.use(express.static('public'));
//tells application that we are using body parser and to include the middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session);


//sets the template engine to use for the express object
//a template engine will implement the view part of the app
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//!!key data should be put in another key file
var openWeatherKey = '&appid=fa7d80c48643dfadde2cced1b1be6ca1';
//used to get Seattle weather information
var zipURL = 'http://api.openweathermap.org/data/2.5/weather?zip='
var cityOrZip = 98112;
var units = '&units=imperial';
var weatherURL = zipURL + cityOrZip + units + openWeatherKey;

var context = {};
// [START hello_world]
// Say hello!
app.get('/', function (req, res) {

    //get time information
    var now = new time.Date();
    now.setTimezone("America/Los_Angeles");
    var datetime = "Current Time: " + now.toString();
    //res.status(200).send('Hello, Cloud, Ben Fisher CS 496 Cloud mobile development!');
   
    context.dateTime = "" + datetime;

    //increment session
    context.count = req.session.count || 0;
    req.session.count += 1;
    context.countText = "Session Count = " + context.count;

    //get weather information
    request(weatherURL, function(err, response, body){

      var response = JSON.parse(body);	
      if (err || response.statusCode < 200 || response.statusCode >= 400) {
        return res.sendStatus(500);
      }
      
      context.city = response.name;
      context.country = response.sys.country;
      context.weather = response.weather[0].description;
      context.country = response.sys.country;
      context.windDirection = response.wind.deg + " degrees";
      context.windSpeed = response.wind.speed + " miles per hour";
      context.temperature = response.main.temp + " F";
      context.humidity = response.main.humidity + "%";	    

      res.render('home', context);
    });			

  });
// [END hello_world]

//listener all for unrecognized urls
//return 404 not found response
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

//listener for errors generate on server
//return 500 response
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});


if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
